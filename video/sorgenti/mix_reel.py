# Audio for the Reel (reel.html): the demo track from its drop (bar 9) for 9 bars, then its natural
# ending (bar 20 -> end), with a whoosh every time the phone leaves.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
bar=lambda n:B0+n*BAR
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
A=m[int(bar(9)*SR):int(bar(18)*SR)]; B=m[int(bar(20)*SR):int((bar(20)+4.31)*SR)]
x=12*SR//1000; r=np.linspace(0,1,x)[:,None]; A[-x:]=A[-x:]*(1-r)+B[:x]*r
out=np.vstack([A,B[x:]])*0.9; N=len(out)
rng=np.random.default_rng(3)
def whoosh(t,dur=.45,gain=.12):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(600,7000,n); a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=int((t-dur*.8)*SR); e=min(N,s+n); out[s:e]+=y[:e-s,None]
for k in range(3,9): whoosh((k+1)*BAR)       # phone flies out at the end of each feature
whoosh(2*BAR,gain=.08); whoosh(9*BAR,gain=.08)
fo=int(.7*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_reel.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('build/mix_reel.wav durata',round(N/SR,2))
