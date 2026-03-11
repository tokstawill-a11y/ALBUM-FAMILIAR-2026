"use client";

interface Member {
  id: string;
  name: string | null;
  image: string | null;
  _count: { uploadedMedia: number };
}

interface FamilyMembersProps {
  members: Member[];
  selectedMemberId: string | null;
  onSelectMember: (id: string | null) => void;
}

export default function FamilyMembers({ members, selectedMemberId, onSelectMember }: FamilyMembersProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center gap-3">
        <i className="fas fa-users-viewfinder"></i> Miembros de la Familia
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectMember(selectedMemberId === member.id ? null : member.id)}
            className={`bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition cursor-pointer border-2 ${
              selectedMemberId === member.id ? "border-amber-500 scale-105" : "border-transparent"
            }`}
          >
            <div className="relative mx-auto mb-3 w-20 h-20">
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name || "Miembro"}
                  className="w-full h-full rounded-full object-cover border-2 border-amber-400"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-400 text-amber-800 font-bold text-2xl">
                  {member.name?.[0] || "?"}
                </div>
              )}
            </div>
            <h3 className="font-bold text-amber-800 truncate">{member.name}</h3>
            <p className="text-sm text-amber-600/70">{member._count.uploadedMedia} fotos</p>
          </div>
        ))}
        
        {/* Add Member Simulation */}
        <div 
           className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition cursor-pointer border-2 border-dashed border-amber-300 flex flex-col items-center justify-center"
           onClick={() => {
              const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/register` : '';
              const text = `¡Hola! Únete a nuestro Álbum Familiar: ${shareUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
           }}
        >
          <div className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-amber-400 bg-amber-50 flex items-center justify-center shadow-inner">
            <i className="fas fa-plus text-3xl text-amber-600"></i>
          </div>
          <h3 className="font-bold text-amber-800">Invitar</h3>
        </div>
      </div>
    </section>
  );
}
