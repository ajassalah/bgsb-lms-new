export function TopbarProfileAvatar({
  name,
  avatar,
}: {
  name: string;
  avatar?: string | null;
}) {
  return (
    <img
      src={avatar || "/api/account/avatar"}
      alt={`${name} profile`}
      className="size-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm"
    />
  );
}
