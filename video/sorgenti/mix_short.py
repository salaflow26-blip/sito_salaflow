# Audio for the short Instagram cut: music from bar 5 so the drop lands when the phone arrives (8.6s),
# end card on the track's natural ending (bar 20 -> end), whooshes on cuts, taps where the app is touched.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
bar=lambda n:B0+n*BAR; beat=lambda n:B0+n*BAR/4
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
A=m[int(bar(5)*SR):int(bar(18)*SR)]              # 13 bars: calm intro, drop, groove
B=m[int(bar(20)*SR):int((bar(22)+.03)*SR)]        # natural ending
x=12*SR//1000                                      # tiny crossfade at the bar-aligned join
r=np.linspace(0,1,x)[:,None]; A[-x:]=A[-x:]*(1-r)+B[:x]*r
out=np.vstack([A,B[x:]])*0.9; N=len(out)
# long-timeline -> short-timeline mapping (same slices as stage.html)
F=1.5*BAR
SEG=[(0,0,bar(2),2*BAR),(2*BAR,bar(2)-.15,bar(4)-.15,2*BAR),
     (4*BAR,bar(4)-.15,bar(4)-.15+F,F),(4*BAR+F,bar(6)+.1,bar(6)+.1+F,F),(4*BAR+2*F,bar(9),bar(9)+F,F),
     (4*BAR+3*F,bar(11),bar(11)+F,F),(4*BAR+4*F,bar(13)+.6,bar(13)+.6+F,F),(4*BAR+5*F,bar(15)+.6,bar(15)+.6+F,F)]
def to_short(tl):
    for s0,a,b,d in SEG:
        if a<=tl<b: return s0+(tl-a)/(b-a)*d
rng=np.random.default_rng(7)
def whoosh(t,dur=0.6,gain=0.16,up=True):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(400,7000,n) if up else np.linspace(7000,400,n)
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=max(0,int((t-dur*.7)*SR)); e=min(N,s+n); out[s:e]+=y[:e-s,None]
def tap(t,gain=0.16):
    n=int(0.05*SR); tt=np.arange(n)/SR
    y=(np.sin(2*np.pi*1900*tt)*.6+np.sin(2*np.pi*3100*tt)*.4)*np.exp(-tt*90)*gain
    s=int(t*SR); out[s:s+n]+=y[:,None]
for k,c in enumerate([g[0] for g in SEG[1:]]+[13*BAR]): whoosh(c, up=k%2==0, gain=.16 if k in (1,7) else .09)
for tl in [bar(6)+1.15, beat(46), beat(47), beat(49.5), bar(13)+1.0, bar(14)-.05]:
    ts=to_short(tl); 
    if ts is not None: tap(ts)
ts=to_short(bar(14)-.05+.75); tap(ts,gain=.1)
fi=int(.25*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(.8*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_short.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('durata audio', round(N/SR,2), 'peak', round(pk,3))
