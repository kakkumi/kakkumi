import CreatorProfileClient from "./CreatorProfileClient";

export default async function CreatorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <CreatorProfileClient creatorId={id} />;
}
