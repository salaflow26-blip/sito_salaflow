# Music + sound design for the long version.   python3 mix.py        -> build/mix.wav      (Instagram)
#                                              python3 mix.py site   -> build/mix_site.wav (sito, +2 battute)
import sys, numpy as np, wave
SITE = sys.argv[1:] == ['site']
SR=48000; BAR=2.1413; B0=0.163
# site version: 2 extra bars before bar 13 (the promemoria scene), same shift as stage.html
INS, EXT = 13, (2 if SITE else 0)
rawbar=lambda n:B0+n*BAR
bar=lambda n:rawbar(n+EXT if n>=INS else n); beat=lambda n:bar(n/4)
PM0=rawbar(INS)
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
if SITE:
    # Repeat bars 11-12: they sound almost like 12-13, so after bar 12 the track plays 11-12 again
    # and then carries on from 13 as before. Only one join, lined up on the drum hits.
    j=int(round(rawbar(INS)*SR)); L=int(round(EXT*BAR*SR)); W=int(.5*SR)
    hp=np.diff(m.mean(1),prepend=0)                     # high-passed: transients decide the alignment
    ref=hp[j:j+W]
    def score(k): seg=hp[k:k+W]; return float(seg@ref/np.sqrt((seg@seg)*(ref@ref)))
    k=max(range(j-L-int(.03*SR), j-L+int(.03*SR)+1, 8),key=score)
    k=max(range(k-8,k+9),key=score)
    x=int(.012*SR); r=np.linspace(0,1,x)[:,None]
    blend=m[j-x:j]*(1-r)+m[k-x:k]*r                     # 12 ms crossfade into the repeat
    m=np.vstack([m[:j-x],blend,m[k:j],m[j:]])
    print(f'join: bars 11-12 repeated, {(j-L-k)/SR*1000:+.1f} ms from the grid, match {score(k):.3f}')
END=47.3+EXT*BAR; N=int(END*SR)
m=m[:N]
if len(m)<N: m=np.vstack([m,np.zeros((N-len(m),2))])
out=m*0.9
rng=np.random.default_rng(7)
def whoosh(t,dur=0.9,gain=0.22,up=True):
    n=int(dur*SR); x=rng.standard_normal(n)
    # sweep a one-pole lowpass cutoff for an airy whoosh
    fc=np.linspace(300,6000,n) if up else np.linspace(6000,300,n)
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*x[i]; y[i]=p
    env=np.sin(np.linspace(0,np.pi,n))**2
    y=y*env/ (np.abs(y).max()+1e-9)*gain
    s=int((t-dur*0.6)*SR)
    pan=np.linspace(-.6,.6,n) if up else np.linspace(.6,-.6,n)
    L=y*(1-pan)/2*2; R=y*(1+pan)/2*2
    e=min(N,s+n); out[s:e,0]+=L[:e-s]; out[s:e,1]+=R[:e-s]
def tap(t,gain=0.16):
    n=int(0.05*SR); tt=np.arange(n)/SR
    y=(np.sin(2*np.pi*1900*tt)*0.6+np.sin(2*np.pi*3100*tt)*0.4)*np.exp(-tt*90)*gain
    s=int(t*SR); out[s:s+n,0]+=y; out[s:s+n,1]+=y
for t,up in [(bar(2),True),(bar(4)+.3,True),(bar(8)+.1,False),(bar(9)-.05,True),(bar(15)+.2,False),(bar(19),True)]: whoosh(t,up=up)
for t in [bar(5.75)+.35, bar(6)+1.15, bar(10.9)+.15, beat(46), beat(47), beat(49.5), bar(13)+1.0, bar(14)-.05]: tap(t)
# ticket landing in the kitchen
tap(bar(14)-.05+.75,gain=.1)
if SITE:
    whoosh(PM0+.35,dur=.7,gain=.1,up=False)            # into the promemoria scene
    tap(PM0+2.2)                                        # "Sì"
    tap(PM0+2.2+.5,gain=.08)                            # table 111 leaves
# fades
fi=int(.3*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(1.2*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max();
if pk>0.98: out*=0.98/pk
name='build/mix_site.wav' if SITE else 'build/mix.wav'
w=wave.open(name,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print(name,'durata',round(N/SR,2),'peak',round(pk,3))
