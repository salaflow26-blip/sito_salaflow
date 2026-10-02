# Audio for spot2.html: demo track from bar 5, bars 11-13 looped, then its ending; whooshes on the cuts.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
cuts=[3,4.25,5.5,7,8,9.5,11,12,13.25]
END=16*BAR; N=int(END*SR)
m=np.fromfile('build/music.raw',dtype=np.float32).reshape(-1,2).astype(np.float64)
at=lambda b:int(round((B0+b*BAR)*SR))
x=int(.012*SR); r=np.linspace(0,1,x)[:,None]
parts=[m[at(5):at(11)]]; tail=m[at(13):]; loop=m[at(11):at(13)]
need=N-len(parts[0])-len(tail)
while need>0: parts.append(loop); need-=len(loop)
parts.append(tail)
mus=parts[0]
for p in parts[1:]: mus=np.vstack([mus[:-x],mus[-x:]*(1-r)+p[:x]*r,p[x:]])
if len(mus)<N: mus=np.vstack([mus,np.zeros((N-len(mus),2))])
out=mus[:N]*0.85
rng=np.random.default_rng(11)
def whoosh(t,dur=.45,gain=.08):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(800,6500,n); a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=max(0,int((t-dur*.7)*SR)); e=min(N,s+n); out[s:e]+=y[:e-s,None]
for c in cuts: whoosh(c*BAR)
fi=int(.2*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(1.5*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_spot2.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('build/mix_spot2.wav',round(END,2))
