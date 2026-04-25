using SprintTracker.Database.Models;
using SprintTracker.DTO.Requests;


namespace SprintTracker.Mapper
{
    public class UserStoryMapper
    {
        public UserStory MapToUserStory(CreateUserStoryRequest request)
        {
            return new UserStory
            {
                Title = request.Title,
                Description = request.Description,
                Status = Enum.TryParse<UserStoryStatus>(request.Status.Replace(" ", ""), out var status) ? status : UserStoryStatus.ToDo,
                SprintId = request.SprintId
            };
        }

        public void MapToUserStory(UpdateUserStoryRequest request, UserStory userStory)
        {
            if (!string.IsNullOrEmpty(request.Title))
            {
                userStory.Title = request.Title;
            }
            if (!string.IsNullOrEmpty(request.Description))
            {
                userStory.Description = request.Description;
            }
            if (!string.IsNullOrEmpty(request.Status))
            {
                userStory.Status = Enum.TryParse<UserStoryStatus>(request.Status.Replace(" ", ""), out var status) ? status : userStory.Status;
            }
            if (request.SprintId.HasValue)
            {
                userStory.SprintId = request.SprintId.Value;
            }
        }
    }
}