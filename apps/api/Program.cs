using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using WorkoutApp.Data;
using System.Security.Claims;
using WorkoutApp.Dtos;
using WorkoutApp.Models;

var builder = WebApplication.CreateBuilder(args);

// OpenAPI
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Auth0 JWT
var auth0Domain = builder.Configuration["Auth0:Domain"];     // e.g.: dev-xxxx.us.auth0.com
var auth0Audience = builder.Configuration["Auth0:Audience"]; // e.g.: https://workouttracker-api

if (string.IsNullOrWhiteSpace(auth0Domain) || string.IsNullOrWhiteSpace(auth0Audience))
{
    throw new InvalidOperationException("Missing Auth0 configuration. Set Auth0:Domain and Auth0:Audience.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain}/";
        options.Audience = auth0Audience;
    });

builder.Services.AddAuthorization();

var app = builder.Build();
app.UseCors();

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

// Important order:
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok("OK"));

// Test endpoint: requires token
app.MapGet("/me", (ClaimsPrincipal user) =>
{
    var sub =
        user.FindFirst("sub")?.Value ??
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    return Results.Ok(new
    {
        sub,
        // keep scopes and issuer for debugging
        iss = user.FindFirst("iss")?.Value,
        aud = user.Claims.Where(c => c.Type == "aud").Select(c => c.Value).ToArray(),
        scope = user.FindFirst("scope")?.Value,
    });
})
.RequireAuthorization();

app.MapPost("/workouts", async (AppDbContext db, ClaimsPrincipal user, WorkoutCreateDto dto) =>
{
    var sub =
    user.FindFirst("sub")?.Value ??
    user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(sub))
        return Results.Unauthorized();

    var workout = new Workout
    {
        UserId = sub,
        Title = dto.Title,
        Date = dto.DateUtc ?? DateTime.UtcNow
    };

    db.Workouts.Add(workout);
    await db.SaveChangesAsync();

    return Results.Created($"/workouts/{workout.Id}", workout);
})
.RequireAuthorization();

app.MapGet("/api/plans/active", async (AppDbContext db, ClaimsPrincipal user) =>
{
    var sub =
        user.FindFirst("sub")?.Value ??
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(sub))
        return Results.Unauthorized();

    var activePlan = await db.Plans
        .Include(p => p.Days)
            .ThenInclude(d => d.Exercises)
        .FirstOrDefaultAsync(p => p.UserId == sub && p.IsActive);

    if (activePlan is null)
        return Results.NotFound();

    return Results.Ok(PlanMappings.MapPlanResponse(activePlan));
})
.RequireAuthorization();

app.MapPost("/api/plans", async (AppDbContext db, ClaimsPrincipal user, CreatePlanRequest request) =>
{
    var sub =
        user.FindFirst("sub")?.Value ??
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(sub))
        return Results.Unauthorized();

    var activePlans = await db.Plans
        .Where(p => p.UserId == sub && p.IsActive)
        .ToListAsync();

    foreach (var existingActivePlan in activePlans)
    {
        existingActivePlan.IsActive = false;
        existingActivePlan.UpdatedAtUtc = DateTime.UtcNow;
    }

    var plan = new Plan
    {
        UserId = sub,
        Name = request.Name,
        IsActive = true,
        CreatedAtUtc = DateTime.UtcNow,
        UpdatedAtUtc = DateTime.UtcNow,
        Days = request.Days.Select(day => new PlanDay
        {
            Name = day.Name,
            DayIndex = day.DayIndex,
            Exercises = day.Exercises.Select(exercise => new PlanDayExercise
            {
                ExerciseId = exercise.ExerciseId,
                ExerciseName = exercise.ExerciseName,
                SortOrder = exercise.SortOrder,
                Sets = exercise.Sets,
                Reps = exercise.Reps,
                StartWeight = exercise.StartWeight
            }).ToList()
        }).ToList()
    };

    db.Plans.Add(plan);
    await db.SaveChangesAsync();

    var createdPlan = await db.Plans
        .Include(p => p.Days)
            .ThenInclude(d => d.Exercises)
        .FirstAsync(p => p.Id == plan.Id);

    return Results.Created($"/api/plans/{createdPlan.Id}", PlanMappings.MapPlanResponse(createdPlan));
})
.RequireAuthorization();

app.MapGet("/api/logs", async (AppDbContext db, ClaimsPrincipal user) =>
{
    var sub =
        user.FindFirst("sub")?.Value ??
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(sub))
        return Results.Unauthorized();

    var logs = await db.WorkoutLogs
        .Where(log => log.UserId == sub)
        .OrderByDescending(log => log.LoggedAtUtc)
        .ToListAsync();

    var response = logs
        .Select(WorkoutLogMappings.MapWorkoutLogResponse)
        .ToList();

    return Results.Ok(response);
})
.RequireAuthorization();

app.MapPost("/api/logs", async (AppDbContext db, ClaimsPrincipal user, CreateWorkoutLogRequest request) =>
{
    var sub =
        user.FindFirst("sub")?.Value ??
        user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrWhiteSpace(sub))
        return Results.Unauthorized();

    var log = new WorkoutLog
    {
        UserId = sub,
        PlanDayId = request.PlanDayId,
        PlanDayName = request.PlanDayName,
        ExerciseId = request.ExerciseId,
        ExerciseName = request.ExerciseName,
        PerformedWeight = request.PerformedWeight,
        PerformedReps = request.PerformedReps,
        WeekIndex = request.WeekIndex,
        LoggedAtUtc = DateTime.UtcNow
    };

    db.WorkoutLogs.Add(log);
    await db.SaveChangesAsync();

    return Results.Created($"/api/logs/{log.Id}", WorkoutLogMappings.MapWorkoutLogResponse(log));
})
.RequireAuthorization();

app.Run();

public record WorkoutCreateDto(string Title, DateTime? DateUtc);
