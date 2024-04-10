INSERT INTO users (name, email, password) 
VALUES
  ('Eva Stanley', 'sebastianguerra@ymail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
  ('Louisa Meyer', 'jacksonrose@hotmail.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u'),
  ('Dominic Parks', 'victoriablackwell@outlook.com', '$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u')
;

INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, parking_spaces, number_of_bathrooms, number_of_bedrooms, country, street, city, province, post_code, active)
VALUES
(1, 'Speed lamp', 'description ', 'https://via.placeholder.com/200', 'https://via.placeholder.com/200', 100, 2, 2, 2, 'Canada', '1234 Fake St', 'Vancouver', 'BC', 'V5V 5V5', TRUE),
(1, 'Blank corner', 'description ', 'https://via.placeholder.com/200', 'https://via.placeholder.com/200', 50, 1, 1, 1, 'USA', '5678 Real St', 'Los Angeles', 'CA', '90001', TRUE),
(2, 'Habit mix', 'description ', 'https://via.placeholder.com/200', 'https://via.placeholder.com/200', 75, 0, 1, 1, 'Canada', '91011 Forest St', 'Whistler', 'BC', 'V0N 1B0', TRUE)
;


INSERT INTO reservations (start_date, end_date, property_id, guest_id)
VALUES 
('2018-09-11', '2018-09-26', 2, 3),
('2019-01-04', '2019-02-01', 2, 2),
('2023-10-01', '2023-10-14', 1, 3)
;

INSERT INTO property_reviews (guest_id, property_id, reservation_id, rating, message)
VALUES
(3, 3, 1, 3, 'messages'),
(2, 2, 2, 4, 'messages'),
(3, 1, 3, 4, 'messages')
;


