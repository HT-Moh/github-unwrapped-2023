import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { z } from "zod";
import { Gradient } from "../Gradients/NativeGradient";
import { Noise } from "../Noise";
import { Rocket } from "./Rocket";
import { TitleCardOctocat } from "./TitleCardOctocat";
import { TopLanguagesTitle } from "./TopLanguagesTitle";

export const topLanguagesTitleCardSchema = z.object({
  login: z.string(),
  pluralizeLanguages: z.boolean(),
});

export const TopLanguagesTitleCard: React.FC<
  z.infer<typeof topLanguagesTitleCardSchema>
> = ({ login, pluralizeLanguages }) => {
  const frame = useCurrentFrame();
  const zoomOutProgress = interpolate(frame, [0, 80], [0, 1]);
  const scale = interpolate(zoomOutProgress, [0, 1], [1.3, 1]);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
      }}
    >
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <Gradient gradient="blueRadial" />
      </AbsoluteFill>
      <Sequence from={30} style={{ transform: `translateY(-300px)` }}>
        <AbsoluteFill style={{ marginTop: 100, marginLeft: 300 }}>
          <Rocket />
        </AbsoluteFill>
      </Sequence>
      <TitleCardOctocat />
      <AbsoluteFill style={{ opacity: 0.5 }}>
        <Noise translateX={0} translateY={0} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TopLanguagesTitle pluralize={pluralizeLanguages} login={login} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
