# Airport Check-In Kiosk System - Backend

Spring Boot backend application with concurrency control for the Airport Check-In Kiosk System.

## Technology Stack

- **Java 21** (LTS)
- **Spring Boot 3.4.1**
- **PostgreSQL 17+**
- **Spring Data JPA**
- **Spring WebSocket** (STOMP)
- **Flyway** (Database Migrations)
- **Lombok** (Code Generation)
- **Maven** (Build Tool)

## Prerequisites

- Java JDK 21 (LTS version)
- Maven 3.10+
- PostgreSQL 17+ (or use H2 for testing)

## Setup Instructions

### 1. Database Setup

Create PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE airport_kiosk;

# Create user (optional)
CREATE USER kiosk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE airport_kiosk TO kiosk_user;
```

### 2. Configure Database

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/airport_kiosk
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### 3. Set Java 21

**Important**: Maven must use Java 21. Set JAVA_HOME before building:

```bash
# Set Java 21
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
# Or use the helper script:
source ./set-java21.sh

# Verify Java version
java -version  # Should show Java 21.0.9
mvn -version   # Should show Java version: 21.0.9
```

**To make it permanent**, add to your `~/.zshrc`:
```bash
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
export PATH="$JAVA_HOME/bin:$PATH"
```

### 4. Build and Run

```bash
# Install dependencies and compile
mvn clean install

# Run the application
mvn spring-boot:run

# Or run the JAR
java -jar target/kiosk-1.0.0.jar
```

The application will start on `http://localhost:8080`

### 4. Database Migrations

Flyway will automatically run migrations on startup. To run manually:

```bash
mvn flyway:migrate
```

## Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/airport/kiosk/
│   │   │   ├── AirportKioskApplication.java
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST API controllers
│   │   │   ├── service/         # Business logic with concurrency control
│   │   │   ├── repository/      # JPA repositories
│   │   │   ├── model/           # Entity classes
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   └── exception/       # Custom exceptions
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/   # Flyway migration scripts
│   └── test/                    # Test classes
└── pom.xml
```

## API Endpoints

### Booking Endpoints
- `POST /api/bookings/search` - Search booking by reference or passport
- `GET /api/bookings/{bookingId}` - Get booking details

### Seat Endpoints
- `GET /api/flights/{flightId}/seats` - Get seat map
- `GET /api/flights/{flightId}/seats/assignments` - Get seat assignments with passenger details
- `POST /api/flights/{flightId}/seats/{seatId}/lock` - Lock a seat (30s TTL)
- `POST /api/flights/{flightId}/seats/{seatId}/confirm` - Confirm seat selection (auto-releases old seats)
- `DELETE /api/flights/{flightId}/seats/{seatId}/unlock` - Release seat lock

### Baggage Endpoints
- `POST /api/bookings/{bookingId}/baggage` - Check in baggage
- `GET /api/flights/{flightId}/baggage/count` - Get baggage count

### Boarding Pass Endpoints
- `POST /api/bookings/{bookingId}/boarding-pass` - Generate boarding pass
- `GET /api/bookings/{bookingId}/boarding-pass/pdf` - Download PDF

## WebSocket Endpoints

- WebSocket URL: `ws://localhost:8080/ws`
- Topics:
  - `/topic/flights/{flightId}/seats` - Seat status updates
  - `/topic/flights/{flightId}/baggage` - Baggage count updates

## Concurrency Features

### Seat Locking
- **Pessimistic Locking**: Uses `synchronized` methods with TTL (30 seconds)
- **Database Transactions**: `@Transactional` ensures atomicity
- **Optimistic Locking**: `@Version` field prevents concurrent modifications
- **Real-time Updates**: WebSocket broadcasts seat status changes
- **Seat Replacement**: Automatically releases old seats when booking confirms a new one
- **One Seat Per Booking**: Ensures each booking has only one reserved seat per flight

### Baggage Counting
- **Atomic Operations**: Uses `synchronized` methods and atomic SQL increments
- **Transaction Isolation**: `REPEATABLE_READ` isolation level
- **Real-time Sync**: WebSocket broadcasts baggage count updates

### Input Validation
- **Case-Insensitive Search**: Booking references and passport numbers are normalized
- **Consistent Storage**: All booking IDs stored in uppercase for consistency
- **Null Safety**: Comprehensive null checks and validation

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=SeatServiceTest
```

## Troubleshooting

### Lombok Not Working
If you see compilation errors about missing getters/setters:

1. **IDE Setup**: Install Lombok plugin in your IDE (IntelliJ IDEA / Eclipse)
2. **Enable Annotation Processing**: In IDE settings, enable annotation processing
3. **Maven**: Lombok should work automatically with Maven, but ensure annotation processing is enabled

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `application.properties`
- Ensure database exists: `psql -U postgres -l | grep airport_kiosk`

### Port Already in Use
Change the port in `application.properties`:
```properties
server.port=8081
```

## Development Notes

- **Concurrency Control**: All seat operations use `synchronized` methods
- **Lock TTL**: Seat locks expire after 30 seconds automatically
- **WebSocket**: Real-time updates broadcast to all connected clients
- **Database**: Uses PostgreSQL with Flyway for schema management

## License

This project is part of the Airport Check-In Kiosk System assignment.

