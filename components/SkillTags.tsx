
interface Props {
  tags: string[];
}

export default function SkillTags({ tags }: Props) {
  if (!tags.length) return <p className="text-gray-500">No skills selected.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
