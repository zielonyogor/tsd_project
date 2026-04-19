using FluentAssertions;
using SprintTracker.Mapper;
using SprintTracker.DTO.Requests;

namespace SprintTracker.Tests.Mapper
{
    public class SprintMapperTests
    {
        [Fact]
        public void MapToSprint_ShouldHandleSpacesInName()
        {
            var mapper = new SprintMapper();
            var request = new CreateSprintRequest 
            { 
                Name = "Sprint 1", 
                StartDate = DateTime.UtcNow, 
                EndDate = DateTime.UtcNow.AddDays(14) 
            };
            var result = mapper.MapToSprint(request);

            result.Name.Should().Be("Sprint 1");
            result.StartDate.Should().Be(request.StartDate);
            result.EndDate.Should().Be(request.EndDate);
        }
    }
}