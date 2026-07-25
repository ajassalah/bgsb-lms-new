"use client";
import { useRef, useState } from "react";
import { Image as ImageIcon, Trash2, Upload, Video } from "lucide-react";

export function CourseMediaFields({
  basic,
  videoSource,
  setVideoSource,
  existingThumbnail,
  existingVideo,
}: {
  basic: Record<string, string>;
  videoSource: string;
  setVideoSource: (value: string) => void;
  existingThumbnail?: string | null;
  existingVideo?: string | null;
}) {
  const [thumbnail, setThumbnail] = useState(existingThumbnail || ""),
    [removedThumbnail, setRemovedThumbnail] = useState(false),
    [removedVideo, setRemovedVideo] = useState(false),
    [video, setVideo] = useState(
      videoSource === "upload" ? existingVideo || "" : "",
    ),
    [videoLink, setVideoLink] = useState(
      videoSource === "youtube" ? existingVideo || "" : "",
    ),
    thumbnailInput = useRef<HTMLInputElement>(null),
    videoInput = useRef<HTMLInputElement>(null);
  function choose(file: File | undefined, type: "thumbnail" | "video") {
    if (!file) return;
    const url = URL.createObjectURL(file);
    type === "thumbnail" ? setThumbnail(url) : setVideo(url);
  }
  function clear(type: "thumbnail" | "video") {
    if (type === "thumbnail") {
      setThumbnail("");
      setRemovedThumbnail(true);
      if (thumbnailInput.current) thumbnailInput.current.value = "";
    } else {
      setVideo("");
      setRemovedVideo(true);
      if (videoInput.current) videoInput.current.value = "";
    }
  }
  const thumbnailBlock = (
    <MediaCard
      title="Thumbnail"
      preview={thumbnail}
      remove={() => clear("thumbnail")}
    >
      <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-5">
        <ImageIcon className="mb-2 text-red" />
        <b>Upload thumbnail image</b>
        <small className="mt-1 text-slate-400">
          Optional · JPG, PNG or WebP
        </small>
        <input
          ref={thumbnailInput}
          name="thumbnail"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="mt-3 text-xs"
          onChange={(e) => choose(e.target.files?.[0], "thumbnail")}
        />
      </label>
    </MediaCard>
  );
  const videoBlock = (
    <MediaCard
      title="Video Source"
      preview={videoSource === "upload" ? video : ""}
      video
      remove={() => clear("video")}
    >
      <select
        className="field mb-4"
        value={videoSource}
        onChange={(e) => setVideoSource(e.target.value)}
      >
        <option value="upload">Upload</option>
        <option value="youtube">YouTube</option>
      </select>
      {videoSource === "upload" ? (
        <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 p-5">
          <Video className="mb-2 text-red" />
          <b>Upload course video</b>
          <small className="mt-1 text-slate-400">Optional · MP4 or WebM</small>
          <input
            ref={videoInput}
            name="video"
            type="file"
            accept="video/mp4,video/webm"
            className="mt-3 text-xs"
            onChange={(e) => choose(e.target.files?.[0], "video")}
          />
        </label>
      ) : (
        <label className="block text-sm font-semibold">
          Video Link{" "}
          <span className="font-normal text-slate-400">(Optional)</span>
          <input
            name="video_link"
            type="url"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
            className="field mt-2"
            placeholder="https://youtube.com/watch?v=..."
          />
        </label>
      )}
      {videoSource === "youtube" && videoLink && (
        <a
          href={videoLink}
          target="_blank"
          className="mt-3 block truncate rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-600"
        >
          Preview video link: {videoLink}
        </a>
      )}
    </MediaCard>
  );
  return (
    <>
      <input
        type="hidden"
        name="remove_thumbnail"
        value={removedThumbnail ? "true" : "false"}
      />
      <input
        type="hidden"
        name="remove_video"
        value={removedVideo ? "true" : "false"}
      />
      <section className="rounded-xl border bg-slate-50 p-5">
        <h3 className="font-bold text-navy">Step 1 Information</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(basic)
            .filter(([, v]) => v)
            .map(([key, value]) => (
              <div key={key} className="rounded-lg bg-white p-3">
                <small className="block capitalize text-slate-400">
                  {key.replaceAll("_", " ")}
                </small>
                <b className="mt-1 block truncate text-sm text-navy">{value}</b>
              </div>
            ))}
        </div>
      </section>
      <div className="mt-6 space-y-6">
        {thumbnail ? (
          <>
            {thumbnailBlock}
            {videoBlock}
          </>
        ) : (
          <>
            {videoBlock}
            {thumbnailBlock}
          </>
        )}
      </div>
    </>
  );
}
function MediaCard({
  title,
  preview,
  video = false,
  remove,
  children,
}: {
  title: string;
  preview: string;
  video?: boolean;
  remove: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border p-5">
      <h3 className="mb-4 font-bold text-navy">{title}</h3>
      {preview && (
        <div className="relative mb-4 overflow-hidden rounded-xl border bg-slate-950">
          {video ? (
            <video src={preview} controls className="max-h-80 w-full" />
          ) : (
            <img
              src={preview}
              alt="Thumbnail preview"
              className="max-h-80 w-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={remove}
            className="absolute right-3 top-3 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-red shadow"
          >
            <Trash2 className="size-4" />
            Remove
          </button>
        </div>
      )}
      {children}
    </section>
  );
}
