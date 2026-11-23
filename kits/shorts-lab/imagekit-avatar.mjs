// Public URL-only transformation helper. Never place ImageKit private keys,
// upload tokens, dashboard auth codes or user credentials in this browser module.
export const publicDemoPortrait='https://ik.imagekit.io/ikmedia/docs_images/examples/example_portrait_1.jpg';

export function imagekitAvatarVariants(rawUrl=publicDemoPortrait, size=224){
 if(typeof rawUrl!=='string') throw new TypeError('A public ImageKit image URL is required');
 const input=new URL(rawUrl.trim());
 const domain=input.hostname.toLowerCase();
 if(input.protocol!=='https:' || input.username || input.password ||
    !(domain==='ik.imagekit.io'||domain.endsWith('.imagekit.io')) ||
    !/^\/(?:[^/]+\/)*[^/]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(input.pathname)){
   throw new Error('Use a public HTTPS ImageKit JPG, PNG, WebP or AVIF URL');
 }
 if(input.searchParams.has('tr')||/(?:^|\/)tr:/.test(input.pathname))
   throw new Error('Use the original public ImageKit file URL, not an already transformed URL');
 if(!Number.isInteger(size) || size<64 || size>1024)
   throw new RangeError('Avatar dimension must be between 64 and 1024 px');
 const transform=tr=>{
   const url=new URL(input.href);
   url.searchParams.set('tr',tr);
   return url.toString();
 };
 return {
   original:input.href,
   center:transform(`w-${size},h-${size}`),
   face:transform(`w-${size},h-${size},fo-face`),
   circle:transform(`w-${size},h-${size},fo-face:r-max`)
 };
}
