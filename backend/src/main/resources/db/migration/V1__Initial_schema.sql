-- Create ENUM types
CREATE TYPE booking_status_type AS ENUM ('CONFIRMED', 'CHECKED_IN', 'CANCELLED');
CREATE TYPE flight_status_type AS ENUM ('SCHEDULED', 'BOARDING', 'DEPARTED', 'CANCELLED');
CREATE TYPE seat_class_type AS ENUM ('ECONOMY', 'BUSINESS', 'FIRST');
CREATE TYPE seat_status_type AS ENUM ('AVAILABLE', 'LOCKED', 'RESERVED', 'OCCUPIED');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Flights Table
CREATE TABLE flights (
    flight_id VARCHAR(50) PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats > 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    baggage_count INT DEFAULT 0 CHECK (baggage_count >= 0),
    flight_status flight_status_type DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flights_status ON flights(flight_status);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Bookings Table
CREATE TABLE bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    passenger_name VARCHAR(255) NOT NULL,
    passport_number VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    flight_id VARCHAR(50) NOT NULL,
    booking_status booking_status_type DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

CREATE INDEX idx_bookings_flight_id ON bookings(flight_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_passport ON bookings(passport_number);

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Seats Table
CREATE TABLE seats (
    seat_id VARCHAR(50) PRIMARY KEY,
    flight_id VARCHAR(50) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class seat_class_type DEFAULT 'ECONOMY',
    seat_status seat_status_type DEFAULT 'AVAILABLE',
    booking_id VARCHAR(50),
    locked_by VARCHAR(100),
    lock_expiry TIMESTAMP NULL,
    version BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    UNIQUE (flight_id, seat_number)
);

CREATE INDEX idx_seats_flight_id ON seats(flight_id);
CREATE INDEX idx_seats_status ON seats(seat_status);
CREATE INDEX idx_seats_lock_expiry ON seats(lock_expiry) WHERE lock_expiry IS NOT NULL;
CREATE INDEX idx_seats_booking_id ON seats(booking_id) WHERE booking_id IS NOT NULL;

CREATE TRIGGER update_seats_updated_at BEFORE UPDATE ON seats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Baggage Records Table
CREATE TABLE baggage_records (
    baggage_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(50) NOT NULL,
    flight_id VARCHAR(50) NOT NULL,
    baggage_weight DECIMAL(5,2) CHECK (baggage_weight >= 0),
    baggage_count INT DEFAULT 1 CHECK (baggage_count > 0),
    tag_number VARCHAR(50) UNIQUE NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flights(flight_id) ON DELETE CASCADE
);

CREATE INDEX idx_baggage_booking_id ON baggage_records(booking_id);
CREATE INDEX idx_baggage_flight_id ON baggage_records(flight_id);
CREATE INDEX idx_baggage_tag_number ON baggage_records(tag_number);

-- Create Audit Logs Table
CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    session_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_session_id ON audit_logs(session_id);

