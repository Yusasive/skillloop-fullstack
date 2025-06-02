interface Props {
  sessions: any[];
}

export default function SessionCards({ sessions }: Props) {
  if (!sessions.length)
    return <p className="text-gray-500">No sessions yet.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {sessions.map((session, idx) => (
        <div key={idx} className="border p-4 rounded-xl bg-gray-50 shadow">
          <h3 className="font-semibold text-lg">{session.topic}</h3>
          <p className="text-sm text-gray-600">Teacher: {session.teacher}</p>
          <p className="text-sm text-gray-600">Learner: {session.learner}</p>
          <p className="text-sm text-gray-500">Status: {session.status}</p>
        </div>
      ))}
    </div>
  );
}
