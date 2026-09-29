# Audio for primadopo.html: the demo track from bar 7 to its end, uncut (drop on the first situation),
# a whoosh when each "dopo" panel slides in.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
out=m[int((B0+7*BAR)*SR):int(47.3*SR)]*0.9; N=len(out)
rng=np.random.default_rng(5)
def whoosh(t,dur=.45,gain=.11):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(700,7000,n); a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=int((t-dur*.7)*SR); e=min(N,s+n); out[s:e]+=y[:e-s,None]
for i in range(5): whoosh((3+2*i)*BAR)
fi=int(.3*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(.8*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_primadopo.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('build/mix_primadopo.wav durata',round(N/SR,2))
