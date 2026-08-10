using MediatR;

namespace ClothingStore.Application.Feedback.Commands;

public record SubmitFeedbackCommand(string Name, string Email, string Message) : IRequest;
