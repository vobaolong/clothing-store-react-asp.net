using System.Threading.Channels;
using ClothingStore.Application.Common.Interfaces;

namespace ClothingStore.Infrastructure.Security;

public sealed class BackgroundEmailQueue : IBackgroundEmailQueue
{
    private readonly Channel<QueuedEmail> queue = Channel.CreateUnbounded<QueuedEmail>(
        new UnboundedChannelOptions { SingleReader = true, SingleWriter = false }
    );

    public bool TryQueue(string to, string subject, string body)
    {
        return queue.Writer.TryWrite(new QueuedEmail(to, subject, body));
    }

    public ValueTask<QueuedEmail> DequeueAsync(CancellationToken cancellationToken)
    {
        return queue.Reader.ReadAsync(cancellationToken);
    }
}
