import { Composition, Folder } from 'remotion';
import { SerendibTeaser, SerendibWebsiteShowcase } from './SerendibVideos';

export const RemotionRoot = () => {
  return (
    <Folder name="SerendibTrading">
      <Composition
        id="SerendibTeaser"
        component={SerendibTeaser}
        durationInFrames={420}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SerendibWebsiteShowcase"
        component={SerendibWebsiteShowcase}
        durationInFrames={1440}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
