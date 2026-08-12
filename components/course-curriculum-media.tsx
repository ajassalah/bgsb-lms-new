import { VideoPlayer } from "./video-player";

export function CourseCurriculumMedia({ title, thumbnailUrl, videoSource, videoUrl }: { title: string; thumbnailUrl: string | null; videoSource: string | null; videoUrl: string | null }) {
  const embed = videoUrl ? youtubeEmbed(videoUrl) : null;
  return <>
    {thumbnailUrl && <section className="mt-7 overflow-hidden rounded-2xl border bg-white p-2 shadow-sm"><img src={thumbnailUrl} alt={`${title} thumbnail`} className="h-72 w-full rounded-xl object-contain lg:h-96" /></section>}
    {videoUrl && <section className="mx-auto mt-5 w-full max-w-3xl overflow-hidden rounded-2xl border bg-white p-3 shadow-sm sm:p-4">{videoSource === "youtube" && embed ? <iframe src={embed} title={`${title} course video`} className="aspect-video w-full rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : videoSource === "upload" || /\.(mp4|webm|ogg)(\?|$)/i.test(videoUrl) ? <VideoPlayer src={videoUrl} /> : embed ? <iframe src={embed} title={`${title} course video`} className="aspect-video w-full rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Course Video</p><a href={videoUrl} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm font-semibold text-blue-600">Open course video</a></div>}</section>}
  </>;
}
function youtubeEmbed(url:string){try{const parsed=new URL(url),host=parsed.hostname.replace("www.","");let id=host==="youtu.be"?parsed.pathname.slice(1):parsed.searchParams.get("v");if(!id&&parsed.pathname.startsWith("/embed/"))id=parsed.pathname.split("/")[2];if(!id&&parsed.pathname.startsWith("/shorts/"))id=parsed.pathname.split("/")[2];return id?`https://www.youtube.com/embed/${id}`:null}catch{return null}}
