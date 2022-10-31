export type UserSession =
  | {
      user: { email: string; id: string };
      sheets: { id: string; name: string }[];
    }
  | undefined;
