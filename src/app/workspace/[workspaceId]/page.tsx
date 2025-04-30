const WorkspaceIdPage =  async ({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) => {
  const { workspaceId } = await params;
  return (
    <div>
      Id: {workspaceId}
    </div>
  );
};

export default WorkspaceIdPage;