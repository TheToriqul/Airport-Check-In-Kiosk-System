# Airport Check-In Kiosk System - Backend

Spring Boot backend application with concurrency control for the Airport Check-In Kiosk System.

## Technology Stack

- **Java 21** (LTS) - Programming language
- **Spring Boot 3.4.1** - Application framework
- **PostgreSQL 17+** - Database
- **Spring Data JPA** - Data access layer
- **Spring WebSocket** (STOMP) - Real-time communication
- **Flyway 11.0** - Database migrations
- **Lombok 1.18.34** - Code generation
- **Maven 3.10+** - Build tool

## Prerequisites

- **Java JDK 21** (LTS version) - **REQUIRED**
- **Maven 3.10+**
- **PostgreSQL 17+**

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
\q
```

### 2. Configure Database

Update `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/airport_kiosk
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Set Java 21

**CRITICAL**: Maven must use Java 21. Set JAVA_HOME before building:

```bash
# macOS Homebrew
export JAVA_HOME=/opt/homebrew/opt/openjdk@21

# Or use the helper script:
source ./set-java21.sh

# Verify Java version
java -version  # Should show Java 21.0.x
mvn -version   # Should show Java version: 21.0.x
```

**To make it permanent**, add to your `~/.zshrc` or `~/.bashrc`:
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

### 5. Database Migrations

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
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── JacksonConfig.java
│   │   │   │   └── WebSocketConfig.java
│   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── BaggageController.java
│   │   │   │   ├── BoardingPassController.java
│   │   │   │   ├── BookingController.java
│   │   │   │   ├── FlightController.java
│   │   │   │   ├── HealthController.java
│   │   │   │   └── SeatController.java
│   │   │   ├── service/         # Business logic with concurrency control
│   │   │   │   ├── BaggageService.java
│   │   │   │   ├── BoardingPassService.java
│   │   │   │   ├── BookingService.java
│   │   │   │   ├── FlightService.java
│   │   │   │   └── SeatService.java
│   │   │   ├── scheduler/       # Scheduled tasks
│   │   │   │   └── SeatLockCleanupScheduler.java
│   │   │   ├── repository/      # JPA repositories
│   │   │   │   ├── BaggageRepository.java
│   │   │   │   ├── BookingRepository.java
│   │   │   │   ├── FlightRepository.java
│   │   │   │   └── SeatRepository.java
│   │   │   ├── model/           # Entity classes
│   │   │   │   ├── BaggageRecord.java
│   │   │   │   ├── Booking.java
│   │   │   │   ├── Flight.java
│   │   │   │   └── Seat.java
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── ApiResponse.java
│   │   │   │   ├── BaggageCheckInRequest.java
│   │   │   │   ├── BookingSearchRequest.java
│   │   │   │   ├── SeatAssignmentResponse.java
│   │   │   │   ├── SeatConfirmRequest.java
│   │   │   │   └── SeatLockRequest.java
│   │   │   └── exception/       # Custom exceptions
│   │   │       ├── BookingNotFoundException.java
│   │   │       ├── FlightNotFoundException.java
│   │   │       ├── GlobalExceptionHandler.java
│   │   │       └── SeatNotFoundException.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/   # Flyway migration scripts
│   │           ├── V1__Initial_schema.sql
│   │           ├── V2__Insert_sample_data.sql
│   │           └── V3__Add_unique_booking_constraint.sql
│   └── test/                    # Test classes
└── pom.xml
```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Booking Endpoints
- `POST /api/bookings/search` - Search booking by reference or passport (case-insensitive)
  - Request body: `{ "bookingReference": "BK001" }` or `{ "passportNumber": "P12345678" }`
- `GET /api/bookings/{bookingId}` - Get booking details (case-insensitive)
- `GET /api/bookings/flight/{flightId}` - Get all bookings for a specific flight

### Seat Endpoints
- `GET /api/flights/{flightId}/seats` - Get seat map with available count
- `GET /api/flights/{flightId}/seats/assignments` - Get seat assignments with passenger details
- `POST /api/flights/{flightId}/seats/{seatId}/lock` - Lock a seat (30s TTL)
  - Request body: `{ "sessionId": "session-123" }`
- `POST /api/flights/{flightId}/seats/{seatId}/confirm` - Confirm seat selection (auto-releases old seats)
  - Request body: `{ "bookingId": "BK001", "sessionId": "session-123" }`
- `DELETE /api/flights/{flightId}/seats/{seatId}/unlock?sessionId={sessionId}` - Release seat lock

### Baggage Endpoints
- `POST /api/bookings/{bookingId}/baggage` - Check in baggage (case-insensitive booking lookup)
  - Request body: `{ "weight": 23.5, "count": 2 }`
  - **Note:** If a passenger already has baggage checked in, the existing record is updated (passenger-wise update)
- `GET /api/flights/{flightId}/baggage/count` - Get baggage count for a flight
- `GET /api/flights/{flightId}/baggage/debug` - Get detailed baggage debug information (includes flight count, record count, and all records)

### Flight Endpoints
- `GET /api/flights` - Get all flights (sorted by departure time, ascending)
- `GET /api/flights/{flightId}` - Get flight details by ID

### Boarding Pass Endpoints
- `POST /api/bookings/{bookingId}/boarding-pass` - Generate boarding pass (case-insensitive)
- `GET /api/bookings/{bookingId}/boarding-pass/pdf` - Download boarding pass PDF

## WebSocket Endpoints

- **WebSocket URL:** `ws://localhost:8080/ws`
- **Topics:**
  - `/topic/flights/{flightId}/seats` - Seat status updates (LOCKED, RESERVED, AVAILABLE)
  - `/topic/flights/{flightId}/baggage` - Baggage count updates

## Concurrency Features

### Seat Locking
- **Pessimistic Locking**: Uses `synchronized` methods with TTL (30 seconds)
- **Database Transactions**: `@Transactional` ensures atomicity
- **Optimistic Locking**: `@Version` field prevents concurrent modifications
- **Real-time Updates**: WebSocket broadcasts seat status changes
- **Seat Replacement**: Automatically releases old seats when booking confirms a new one
- **One Seat Per Booking**: Ensures each booking has only one reserved seat per flight
- **Case-Insensitive Matching**: All booking lookups use UPPER() for case-insensitive queries

### Baggage Counting
- **Atomic Operations**: Uses `synchronized` methods and atomic SQL increments
- **Transaction Isolation**: `REPEATABLE_READ` isolation level
- **Real-time Sync**: WebSocket broadcasts baggage count updates
- **Passenger-wise Updates**: Each booking can have only one baggage record, but the `baggageCount` field can represent multiple bags
- **Automatic Cleanup**: Duplicate baggage records are automatically cleaned up, keeping only the most recent one per booking

### Input Validation
- **Case-Insensitive Search**: Booking references and passport numbers are normalized
- **Consistent Storage**: All booking IDs stored in uppercase for consistency
- **Null Safety**: Comprehensive null checks and validation
- **Trim & Normalize**: All inputs are trimmed and normalized before processing

## Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=SeatServiceTest
```

## Troubleshooting

### Java Version Issues
If you see compilation errors:
1. Verify Java version: `java -version` (should be 21)
2. Set JAVA_HOME: `export JAVA_HOME=/opt/homebrew/opt/openjdk@21`
3. Verify Maven uses Java 21: `mvn -version`

### Lombok Not Working
If you see compilation errors about missing getters/setters:
1. **IDE Setup**: Install Lombok plugin in your IDE (IntelliJ IDEA / Eclipse)
2. **Enable Annotation Processing**: In IDE settings, enable annotation processing
3. **Maven**: Lombok should work automatically with Maven, but ensure annotation processing is enabled

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `application.properties`
- Ensure database exists: `psql -U postgres -l | grep airport_kiosk`
- Check Flyway migration status: `mvn flyway:info`

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
- **Case-Insensitive Queries**: All booking lookups use UPPER() for case-insensitive matching
- **Seat Replacement**: When confirming a new seat, old reserved seats are automatically released
- **Normalization**: Booking IDs are normalized to uppercase for consistency

## Sample Data

The migration scripts include:
- **V2__Insert_sample_data.sql**: Initial sample data
  - **Flights**: FL001, FL002, FL003, FL004
  - **Bookings**: BK001, BK002, BK003
  - **Seats**: Multiple seats per flight (Economy, Business, First class)
- **V3__Add_unique_booking_constraint.sql**: 
  - Cleans up duplicate baggage records
  - Adds unique constraint on `booking_id` in `baggage_records` table
  - Ensures only one baggage record per booking

## License

This project is part of the Airport Check-In Kiosk System assignment.
