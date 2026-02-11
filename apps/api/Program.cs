using Microsoft.EntityFrameworkCore;
using WorkoutApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Midlertidig kan vi kommentere denne ut
// app.UseHttpsRedirection();

app.MapGet("/health", () => Results.Ok("OK"));

app.Run();
