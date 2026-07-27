using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Backend;

[Table("products")]
public class Product
{
    [Column("id")] // <-- Explicit lowercase mapping
    public int Id { get; set; }
    
    [Required] 
    [Column("name")] // <-- Explicit lowercase mapping
    public string Name { get; set; } = string.Empty;
    
    [Column("description")] // <-- Explicit lowercase mapping
    public string? Description { get; set; }
    
    [Required] 
    [Column("price")] // <-- Explicit lowercase mapping
    public decimal Price { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}
    public DbSet<Product> Products => Set<Product>();
}

