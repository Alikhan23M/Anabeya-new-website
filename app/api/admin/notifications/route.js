export async function GET(request) {
  const encoder = new TextEncoder();
  let controller;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      let isActive = true;

      // Heartbeat interval
      const keepAlive = setInterval(() => {
        if (!isActive) {
          clearInterval(keepAlive);
          return;
        }

        try {
          controller.enqueue(encoder.encode(`data: {"type":"heartbeat","timestamp":"${new Date().toISOString()}"}\n\n`));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          isActive = false;
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup function
      const cleanup = () => {
        isActive = false;
        clearInterval(keepAlive);
      };

      // Handle client disconnect and add cleanup
      if (request?.signal) {
        request.signal.addEventListener('abort', cleanup);
      }

      return () => {
        cleanup();
        if (request?.signal) {
          request.signal.removeEventListener('abort', cleanup);
        }
      };
    },
    cancel() {
      // Handle stream cancellation
      controller?.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}