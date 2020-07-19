/* database: website */

CREATE TABLE Member (
    id VARCHAR(40) NOT NULL,
    password VARCHAR(30),
    username VARCHAR(30) NOT NULL,
    email VARCHAR(30),
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    admin int(11),
    contact_No INT(11),
    PRIMARY KEY (id)
);

CREATE TABLE Task (
    id VARCHAR(40) NOT NULL,
    title VARCHAR(30),
    content VARCHAR(400) DEFAULT NULL,
    date VARCHAR(40) NOT NULL,
    memberId VARCHAR(40),
    status VARCHAR (100),
    member VARCHAR(50),
    PRIMARY KEY (id),
    FOREIGN KEY (memberId) REFERENCES Member(id)
);


CREATE TABLE Task_type(
    id VARCHAR(50),
    userid VARCHAR(50),
    type_title VARCHAR(300),
    type_content VARCHAR(300),
    date_begin VARCHAR(100),
    date_end VARCHAR(50),
    PRIMARY KEY (id),
    FOREIGN KEY (userid) REFERENCES Member(id) ON DELETE CASCADE,
);


CREATE TABLE Task_preference (
    preference VARCHAR(30),
    member_id INT,
    type_id INT,
    PRIMARY KEY (member_id, type_id),
    FOREIGN KEY (member_id) REFERENCES Member(member_id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES Task_type(type_id) ON DELETE CASCADE
);


CREATE TABLE Availability(
    id VARCHAR(100),
    userID VARCHAR(200),
    date CHAR(50),
    PRIMARY KEY (id),
    FOREIGN KEY (userID) REFERENCES Member(id) ON DELETE CASCADE
);
