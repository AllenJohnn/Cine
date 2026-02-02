import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article" | "video.movie" | "profile";
  url?: string;
}

const SITE_NAME = "CineView Hub";

export default function Seo({ title, description, image, type = "website", url }: SeoProps) {
  const resolvedUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{`${title} | ${SITE_NAME}`}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | ${SITE_NAME}`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {resolvedUrl && <meta property="og:url" content={resolvedUrl} />}
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}
