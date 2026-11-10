import sys
from PIL import Image
out=sys.argv[1]; dev=sys.argv[2]; names=sys.argv[3].split(','); cols=int(sys.argv[4]); scale=float(sys.argv[5]); dst=sys.argv[6]
ims=[Image.open(f'{out}/{dev}-{n}.png') for n in names]
w,h=ims[0].size; tw,th=int(w*scale),int(h*scale)
rows=(len(ims)+cols-1)//cols
c=Image.new('RGB',(cols*(tw+8),rows*(th+8)),'white')
for i,im in enumerate(ims):
    c.paste(im.resize((tw,th),Image.LANCZOS),((i%cols)*(tw+8),(i//cols)*(th+8)))
c.save(dst); print(c.size)
