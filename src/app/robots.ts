import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appEnv = process.env.APP_ENV;

  if (appEnv === "production") {
    return {
      rules: [{ userAgent: "*", allow: "/" }],
    };
  }

  return {
    rules: [{ userAgent: "*", disallow: "/" }],
  };
}
