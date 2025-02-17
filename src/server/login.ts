import type { Request, Response } from "express";
import { z } from "zod";
import {
  backendCredentials,
  makeRedirectUriBackend,
} from "../helpers/domain.js";
import {
  clearFailedRendersForUsername,
  clearOgImagesForUsername,
  clearRendersForUsername,
  insertProfileStats,
} from "./db.js";
import { getStatsFromGitHub } from "./get-stats-from-github.js";

export const loginEndPoint = async (request: Request, response: Response) => {
  if (request.method === "OPTIONS") {
    return response.end();
  }

  const query = z
    .object({
      code: z.string(),
      reset: z.string(),
    })
    .or(
      z.object({
        error: z.string(),
        error_description: z.string(),
      }),
    )
    .parse(request.query);

  if ("error" in query) {
    if (query.error === "access_denied") {
      return response.redirect(`/`);
    }

    throw new Error(query.error_description);
  }

  const { CLIENT_SECRET, VITE_CLIENT_ID } = backendCredentials();

  const formdata = new FormData();
  formdata.append("client_id", VITE_CLIENT_ID);
  formdata.append("client_secret", CLIENT_SECRET);
  formdata.append("redirect_uri", makeRedirectUriBackend());
  formdata.append("code", query.code);

  const paramsString = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      body: formdata,
      redirect: "follow",
    },
  );

  const paramsStringText = await paramsString.text();
  const params = new URLSearchParams(paramsStringText);
  const access_token = params.get("access_token");

  if (!access_token) {
    throw new Error("No access token parameter");
  }

  const stats = await getStatsFromGitHub({
    loggedInWithGitHub: true,
    token: access_token,
    username: null,
  });

  if (!stats) {
    throw new Error("No stats");
  }

  await clearFailedRendersForUsername({ username: stats.username });

  if (query.reset === "true") {
    await clearRendersForUsername({ username: stats.username });
    await clearOgImagesForUsername({ username: stats.username });
  }

  await insertProfileStats({
    type: "found",
    profile: stats,
    lowercasedUsername: stats.username.toLowerCase(),
  });

  return response.redirect(`/${stats.username}`);
};
