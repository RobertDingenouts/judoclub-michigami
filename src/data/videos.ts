export interface VideoItem {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
}

export const videoData: VideoItem[] = [
  {
    id: "judoclub-michigami-intro",
    title: "Judoclub Michigami",
    youtubeId: "cpRYCdZFeM0",
    description: "Welkom bij Judoclub Michigami Steenbergen",
  },
];

export const youtubeChannel = {
  url: "https://www.youtube.com/@judoclubmichigami",
  oldUrl: "https://www.youtube.com/user/JudoMichigami",
  title: "Judoclub Michigami YouTube-kanaal",
  subscribeText: "Gratis abonneren op ons YouTube-kanaal",
};
