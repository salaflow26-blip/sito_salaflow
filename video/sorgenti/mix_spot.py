# Audio for spot.html: the demo track from bar 5 (4 bars of build-up, drop on the first feature),
# bars 11-13 looped to cover the features, then the track's ending; a whoosh on every cut.
import numpy as np, wave
SR=48000; BAR=2.1413; B0=0.163
T_FEAT=4*BAR; T_CLAIM=T_FEAT+10*BAR; T_END=T_CLAIM+2*BAR; END=T_END+2.5*BAR; N=int(END*SR)
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
rng=np.random.default_rng(4)
def whoosh(t,dur=.4,gain=.08):
    n=int(dur*SR); xx=rng.standard_normal(n); fc=np.linspace(900,7000,n); a=np.exp(-2*np.pi*fc/SR); y=np.zeros(n); p=0.0
    for i in range(n): p=a[i]*p+(1-a[i])*xx[i]; y[i]=p
    y=y*np.sin(np.linspace(0,np.pi,n))**2/(np.abs(y).max()+1e-9)*gain
    s=max(0,int((t-dur*.7)*SR)); e=min(N,s+n); out[s:e]+=y[:e-s,None]
for i in range(1,10): whoosh(T_FEAT+i*BAR)
whoosh(T_CLAIM,dur=.6,gain=.12); whoosh(T_END,dur=.7,gain=.12)
fi=int(.2*SR); out[:fi]*=np.linspace(0,1,fi)[:,None]
fo=int(1.5*SR); out[-fo:]*=np.linspace(1,0,fo)[:,None]
pk=np.abs(out).max(); out*=min(1,.98/pk)
w=wave.open('build/mix_spot.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype('<i2').tobytes()); w.close()
print('build/mix_spot.wav',round(END,2))
