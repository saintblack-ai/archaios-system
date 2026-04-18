export default {
  async fetch(request, env) {
    const protocol = env.ARCHAIOS_PROTOCOL; // from KV
    const body = await request.json();
    const userQuery = body.query || "";

    const systemPrompt = `
${protocol}
You are ARCHAIOS Cloud Node.
`;

    return Response.json({
      systemPrompt,
      userQuery
    });
  }
};
