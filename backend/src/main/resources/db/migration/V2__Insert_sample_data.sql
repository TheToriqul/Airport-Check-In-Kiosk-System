-- Insert sample flight data
-- Note: airline_name will be added by V4 migration, aircraft_type will be added by V5 migration
INSERT INTO flights (flight_id, flight_number, departure_airport, arrival_airport, departure_time, arrival_time, total_seats, available_seats, flight_status) VALUES
('FL001', 'MH101', 'KUL', 'SIN', '2025-12-10 08:00:00', '2025-12-10 09:00:00', 150, 150, 'SCHEDULED'),
('FL002', 'MH202', 'KUL', 'BKK', '2025-12-15 14:00:00', '2025-12-15 15:30:00', 200, 200, 'SCHEDULED'),
('FL003', 'MH301', 'KUL', 'DXB', '2025-12-20 10:00:00', '2025-12-20 13:30:00', 180, 180, 'SCHEDULED'),
('FL004', 'MH404', 'KUL', 'LHR', '2025-12-25 22:00:00', '2025-12-26 06:00:00', 300, 300, 'SCHEDULED');

-- Insert sample booking (all passport numbers are 9 characters: P + 8 digits)
INSERT INTO bookings (booking_id, passenger_name, passport_number, email, phone, flight_id, booking_status) VALUES
('BK001', 'John Doe', 'P12345678', 'john.doe@email.com', '+1234567890', 'FL001', 'CONFIRMED'),
('BK002', 'Jane Smith', 'P87654321', 'jane.smith@email.com', '+0987654321', 'FL001', 'CONFIRMED'),
('BK003', 'Bob Johnson', 'P11223344', 'bob.johnson@email.com', '+1122334455', 'FL002', 'CONFIRMED'),
('BK004', 'Alice Williams', 'P45678901', 'alice.williams@email.com', '+1234567891', 'FL001', 'CONFIRMED'),
('BK005', 'Charlie Brown', 'P56789012', 'charlie.brown@email.com', '+1234567892', 'FL002', 'CONFIRMED'),
('BK006', 'Diana Prince', 'P67890123', 'diana.prince@email.com', '+1234567893', 'FL002', 'CONFIRMED'),
('BK007', 'Edward Norton', 'P78901234', 'edward.norton@email.com', '+1234567894', 'FL003', 'CONFIRMED'),
('BK008', 'Fiona Apple', 'P89012345', 'fiona.apple@email.com', '+1234567895', 'FL003', 'CONFIRMED');

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

