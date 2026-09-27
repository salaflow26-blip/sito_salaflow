# Audio for the short Instagram cut: music from the build-up (bar 7) so the drop lands at 4.3s,
# end card on the track's natural ending (bar 20 -> end), whooshes on cuts, taps where the app is touched.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
bar=lambda n:B0+n*BAR; beat=lambda n:B0+n*BAR/4
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
A=m[int(bar(7)*SR):int(bar(15)*SR)]              # 8 bars: build-up, drop, groove
B=m[int(bar(20)*SR):int((bar(22)+.03)*SR)]        # natural ending
x=12*SR//1000                                      # tiny crossfade at the bar-aligned join
r=np.linspace(0,1,x)[:,None]; A[-x:]=A[-x:]*(1-r)+B[:x]*r
out=np.vstack([A,B[x:]])*0.9; N=len(out)
# long-timeline -> short-timeline mapping (same slices as stage.html)
SEG=[(0,2.45,4.45,BAR),(BAR,bar(2)-.15,bar(3)+.9,BAR),(2*BAR,bar(4)-.15,bar(4)-.15+BAR,BAR),(3*BAR,bar(6)+.1,bar(6)+.1+BAR,BAR),
     (4*BAR,bar(9),bar(10),BAR),(5*BAR,bar(11),bar(12),BAR),(6*BAR,bar(13)+.9,bar(13)+.9+BAR,BAR),(7*BAR,bar(15)+.9,bar(15)+.9+BAR,BAR)]
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
for k in range(1,9): whoosh(k*BAR, up=k%2==1, gain=.2 if k in (2,8) else .13)
for tl in [bar(6)+1.15, beat(46), beat(47), bar(13)+1.0, bar(14)-.05]:
    ts=to_short(tl); 
    if ts is not None: tap(ts)
ts=to_short(bar(14)-.05+.75); tap(ts,gain=.1)
fi=int(.25*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(.8*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_short.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('durata audio', round(N/SR,2), 'peak', round(pk,3))
