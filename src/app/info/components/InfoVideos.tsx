import React from "react";
import { YouTubeEmbed } from "@next/third-parties/google";

const videos = [
  {
    title: "Getting Started",
    videoId: "UMDX3uFvS3w",
    description:
      "Learn the basics of NEAR governance and how to get started with Agora.",
  },
  {
    title: "How to Vote",
    videoId: "PH75hU8YX4c",
    description:
      "A step-by-step guide on participating in governance through voting.",
  },
];

const InfoVideos = () => {
  return (
    <section className="mt-12">
      <h3 className="text-2xl font-black text-primary mb-6">Getting Started</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        {videos.map((video, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-neutral shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-tertiary/30"
          >
            <div className="relative w-full aspect-video bg-tertiary/5">
              <YouTubeEmbed
                videoid={video.videoId}
                params="controls=1&modestbranding=1&rel=0"
              />
            </div>
            <div className="p-5">
              <h4 className="text-base font-bold text-primary mb-2">
                {video.title}
              </h4>
              <p className="text-sm text-secondary leading-relaxed">
                {video.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InfoVideos;
