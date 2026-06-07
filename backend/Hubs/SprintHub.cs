using Microsoft.AspNetCore.SignalR;

namespace SprintTracker.Hubs
{
    public class SprintHub : Hub
    {
        public Task JoinSprint(int sprintId)
        {
            return Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sprintId));
        }

        public Task LeaveSprint(int sprintId)
        {
            return Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sprintId));
        }

        public static string GroupName(int sprintId) => $"sprint-{sprintId}";
    }
}