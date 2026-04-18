const backendUrl = (process.env.BACKEND_URL ?? 'http://localhost:8080').replace(/\/$/, '');

async function fetchJson(path) {
  const response = await fetch(`${backendUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function run() {
  try {
    const [sprints, userStories] = await Promise.all([
      fetchJson('/Sprint'),
      fetchJson('/UserStory'),
    ]);

    const payload = {
      fetchedAt: new Date().toISOString(),
      backendUrl,
      totals: {
        sprints: Array.isArray(sprints) ? sprints.length : 0,
        userStories: Array.isArray(userStories) ? userStories.length : 0,
      },
      sprints,
      userStories,
    };

    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch backend data: ${message}`);
    process.exitCode = 1;
  }
}

await run();
