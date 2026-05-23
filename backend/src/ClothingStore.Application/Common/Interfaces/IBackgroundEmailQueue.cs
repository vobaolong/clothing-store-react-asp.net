namespace ClothingStore.Application.Common.Interfaces;

public interface IBackgroundEmailQueue
{
	bool TryQueue(string to, string subject, string body);

	ValueTask<QueuedEmail> DequeueAsync(CancellationToken cancellationToken);
}

public sealed record QueuedEmail(string To, string Subject, string Body);
