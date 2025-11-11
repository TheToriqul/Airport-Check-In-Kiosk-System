-- Insert sample flight data
INSERT INTO flights (flight_id, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, total_seats, available_seats, flight_status) VALUES
('FL001', 'AA101', 'JFK', 'LAX', '2025-12-01 08:00:00', '2025-12-01 11:30:00', 150, 150, 'SCHEDULED'),
('FL002', 'AA202', 'LAX', 'JFK', '2025-12-01 14:00:00', '2025-12-01 22:30:00', 200, 200, 'SCHEDULED'),
('FL003', 'UA301', 'ORD', 'SFO', '2025-12-01 10:00:00', '2025-12-01 13:00:00', 180, 180, 'SCHEDULED');

-- Insert sample booking
INSERT INTO bookings (booking_id, passenger_name, passport_number, email, phone, flight_id, booking_status) VALUES
('BK001', 'John Doe', 'P12345678', 'john.doe@email.com', '+1234567890', 'FL001', 'CONFIRMED'),
('BK002', 'Jane Smith', 'P87654321', 'jane.smith@email.com', '+0987654321', 'FL001', 'CONFIRMED'),
('BK003', 'Bob Johnson', 'P11223344', 'bob.johnson@email.com', '+1122334455', 'FL002', 'CONFIRMED');

-- Insert sample seats for FL001 (150 seats: 10 rows x 15 seats per row)
DO $$
DECLARE
    row_num INT;
    seat_letter CHAR;
    seat_id_val VARCHAR(50);
    seat_num_val VARCHAR(10);
    seat_class_val seat_class_type;
BEGIN
    FOR row_num IN 1..10 LOOP
        FOR seat_letter IN 'A'..'F' LOOP
            seat_id_val := 'FL001-S' || LPAD(row_num::TEXT, 2, '0') || seat_letter;
            seat_num_val := row_num || seat_letter;
            
            -- First 2 rows are FIRST class, next 3 are BUSINESS, rest are ECONOMY
            IF row_num <= 2 THEN
                seat_class_val := 'FIRST';
            ELSIF row_num <= 5 THEN
                seat_class_val := 'BUSINESS';
            ELSE
                seat_class_val := 'ECONOMY';
            END IF;
            
            INSERT INTO seats (seat_id, flight_id, seat_number, seat_class, seat_status) 
            VALUES (seat_id_val, 'FL001', seat_num_val, seat_class_val, 'AVAILABLE');
        END LOOP;
    END LOOP;
END $$;

-- Insert sample seats for FL002 (200 seats: 13 rows x ~15 seats)
DO $$
DECLARE
    row_num INT;
    seat_letter CHAR;
    seat_id_val VARCHAR(50);
    seat_num_val VARCHAR(10);
    seat_class_val seat_class_type;
BEGIN
    FOR row_num IN 1..13 LOOP
        FOR seat_letter IN 'A'..'F' LOOP
            seat_id_val := 'FL002-S' || LPAD(row_num::TEXT, 2, '0') || seat_letter;
            seat_num_val := row_num || seat_letter;
            
            IF row_num <= 2 THEN
                seat_class_val := 'FIRST';
            ELSIF row_num <= 5 THEN
                seat_class_val := 'BUSINESS';
            ELSE
                seat_class_val := 'ECONOMY';
            END IF;
            
            INSERT INTO seats (seat_id, flight_id, seat_number, seat_class, seat_status) 
            VALUES (seat_id_val, 'FL002', seat_num_val, seat_class_val, 'AVAILABLE');
        END LOOP;
    END LOOP;
END $$;

