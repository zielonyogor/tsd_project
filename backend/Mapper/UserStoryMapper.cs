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
    }
}