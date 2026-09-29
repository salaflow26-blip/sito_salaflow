# Audio for funzione.html (all episodes): 5 bars of the demo track from its drop,
# whoosh when the phone comes in and a soft tap when the camera zooms on the detail.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
out=m[int((B0+9*BAR)*SR):int((B0+14*BAR)*SR)]*0.9; N=len(out)
rng=np.random.default_rng(9)
def whoosh(t,dur=.45,gain=.12):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(600,7000,n); a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=max(0,int((t-dur*.8)*SR)); e=min(N,s+n); out[s:e]+=y[:e-s,None]
def tap(t,gain=.14):
    n=int(.05*SR); tt=np.arange(n)/SR; y=(np.sin(2*np.pi*1900*tt)*.6+np.sin(2*np.pi*3100*tt)*.4)*np.exp(-tt*90)*gain
    s=int(t*SR); out[s:s+n]+=y[:,None]
whoosh(BAR); tap(2*BAR+.6); whoosh(4*BAR,gain=.08)
fo=int(.6*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_funzione.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('build/mix_funzione.wav durata',round(N/SR,2))
