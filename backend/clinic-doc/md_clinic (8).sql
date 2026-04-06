-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 03:42 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `md_clinic`
--

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `gender` enum('MALE','FEMALE') NOT NULL,
  `birthday` date DEFAULT NULL,
  `region_id` int(11) DEFAULT NULL,
  `district_id` int(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `balance` double DEFAULT 0,
  `description` text DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`id`, `name`, `phone`, `group_id`, `gender`, `birthday`, `region_id`, `district_id`, `address`, `balance`, `description`, `source_id`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'Dilmurod', '(99)967-0395', 1, 'MALE', '1995-03-10', 1733, 1733401, '', 0, '', 1, 1, '2025-11-02 19:30:41', '2025-11-10 22:25:42', 1, 1),
(2, 'Testasd', '(99)967-0395', 1, 'MALE', '1990-11-02', 1733, 1733401, '', 0, '', 1, 1, '2025-11-02 19:31:09', '2025-11-13 22:43:44', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `client_group`
--

CREATE TABLE `client_group` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_group`
--

INSERT INTO `client_group` (`id`, `name`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'Umumiy', 1, '2025-10-24 12:15:24', '2025-10-24 12:15:40', 1, 1),
(2, 'test', -1, '2025-10-24 12:15:43', '2025-10-24 12:15:45', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `client_paid`
--

CREATE TABLE `client_paid` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `payment_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(19,2) NOT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` int(11) DEFAULT 1,
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_paid`
--

INSERT INTO `client_paid` (`id`, `client_id`, `payment_id`, `date`, `description`, `price`, `created`, `updated`, `status`, `register_id`, `modify_id`) VALUES
(1, 1, 1, '2025-11-02', 'asd;laksd;lsjflksjdgfkl sdfklsjdfklsjdf lksdjflk sjdfkl sdjfklsjdlfk jsdlkfjslkdf jksdlfjslkfdj slkdfjk sljdf sdf sdfs fds fsdf', '100000.00', '2025-11-02 20:44:23', '2025-11-02 20:51:39', -1, 1, 1),
(2, 1, 1, '2025-11-10', '', '300000.00', '2025-11-10 21:43:41', '2025-11-10 22:25:42', -1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `departament`
--

CREATE TABLE `departament` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departament`
--

INSERT INTO `departament` (`id`, `name`, `owner_id`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'Diagnostika UZI', 1, 1, '2025-10-04 17:06:38', '2025-10-19 17:02:04', 1, 1),
(2, 'Test', 1, -1, '2025-10-04 14:10:07', '2025-10-04 14:11:04', 1, 1),
(3, 'test', 3, -1, '2025-10-19 17:02:24', '2025-10-19 17:03:51', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `loc_district`
--

CREATE TABLE `loc_district` (
  `id` int(11) NOT NULL,
  `region_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loc_district`
--

INSERT INTO `loc_district` (`id`, `region_id`, `name`, `status`, `created`, `updated`) VALUES
(1703202, 1703, 'Oltinko`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703203, 1703, 'Andijon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703206, 1703, 'Baliqchi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703209, 1703, 'Bo`ston tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703210, 1703, 'Buloqboshi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703211, 1703, 'Jalolquduq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703214, 1703, 'Izboskan tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703217, 1703, 'Ulug`nor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703220, 1703, 'Qo`rg`ontepa tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703224, 1703, 'Asaka tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703227, 1703, 'Marxamat tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703230, 1703, 'Shahrixon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703232, 1703, 'Paxtaobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703236, 1703, 'Xo`jaobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703401, 1703, 'Andijon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1703408, 1703, 'Xonobod shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706204, 1706, 'Olot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706207, 1706, 'Buxoro tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706212, 1706, 'Vobkent tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706215, 1706, 'G`ijduvon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706219, 1706, 'Kogon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706230, 1706, 'Qorako`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706232, 1706, 'Qorovulbozor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706240, 1706, 'Peshku tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706242, 1706, 'Romitan tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706246, 1706, 'Jondor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706258, 1706, 'Shofirkon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706401, 1706, 'Buxoro shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1706403, 1706, 'Kogon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708201, 1708, 'Arnasoy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708204, 1708, 'Baxmal tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708209, 1708, 'G`allaorol tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708212, 1708, 'Sharof Rashidov tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708215, 1708, 'Do`stlik tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708218, 1708, 'Zomin tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708220, 1708, 'Zarbdor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708223, 1708, 'Mirzacho`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708225, 1708, 'Zafarobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708228, 1708, 'Paxtakor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708235, 1708, 'Forish tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708237, 1708, 'Yangiobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1708401, 1708, 'Jizzax shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710207, 1710, 'G`uzor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710212, 1710, 'Dehqonobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710220, 1710, 'Qamashi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710224, 1710, 'Qarshi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710229, 1710, 'Koson tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710232, 1710, 'Kitob tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710233, 1710, 'Mirishkor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710234, 1710, 'Muborak tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710235, 1710, 'Nishon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710237, 1710, 'Kasbi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710240, 1710, 'Ko‘kdala tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710242, 1710, 'Chiroqchi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710245, 1710, 'Shahrisabz tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710250, 1710, 'Yakkabog` tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710401, 1710, 'Qarshi shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1710405, 1710, 'Shahrisabz shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712211, 1712, 'Konimex tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712216, 1712, 'Qiziltepa tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712230, 1712, 'Navbahor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712234, 1712, 'Karmana tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712238, 1712, 'Nurota tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712244, 1712, 'Tomdi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712248, 1712, 'Uchquduq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712251, 1712, 'Xatirchi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712401, 1712, 'Navoiy shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712408, 1712, 'Zarafshon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1712412, 1712, 'G\'ozg\'on shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714204, 1714, 'Mingbuloq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714207, 1714, 'Kosonsoy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714212, 1714, 'Namangan tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714216, 1714, 'Norin tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714219, 1714, 'Pop tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714224, 1714, 'To`raqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714229, 1714, 'Uychi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714234, 1714, 'Uchqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714236, 1714, 'Chortoq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714237, 1714, 'Chust tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714242, 1714, 'Yangiqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714401, 1714, 'Namangan shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718203, 1718, 'Oqdaryo tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718206, 1718, 'Bulung`ur tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718209, 1718, 'Jomboy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718212, 1718, 'Ishtixon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718215, 1718, 'Kattaqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718216, 1718, 'Qo`shrabot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718218, 1718, 'Narpay tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718224, 1718, 'Payariq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718227, 1718, 'Pastdarg`om tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718230, 1718, 'Paxtachi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718233, 1718, 'Samarqand tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718235, 1718, 'Nurobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718236, 1718, 'Urgut tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718238, 1718, 'Tayloq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718401, 1718, 'Samarqand shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1718406, 1718, 'Kattaqo`rg`on shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722201, 1722, 'Oltinsoy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722202, 1722, 'Angor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722203, 1722, 'Bandixon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722204, 1722, 'Boysun tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722207, 1722, 'Muzrabot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722210, 1722, 'Denov tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722212, 1722, 'Jarqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722214, 1722, 'Qumqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722215, 1722, 'Qiziriq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722217, 1722, 'Sariosiyo tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722220, 1722, 'Termiz tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722221, 1722, 'Uzun tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722223, 1722, 'Sherobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722226, 1722, 'Sho`rchi tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1722401, 1722, 'Termiz shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724206, 1724, 'Oqoltin tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724212, 1724, 'Boyovut tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724216, 1724, 'Sayxunobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724220, 1724, 'Guliston tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724226, 1724, 'Sardoba tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724228, 1724, 'Mirzaobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724231, 1724, 'Sirdaryo tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724235, 1724, 'Xovos tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724401, 1724, 'Guliston shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724410, 1724, 'Shirin shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1724413, 1724, 'Yangiyer shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726262, 1726, 'Uchtepa tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726264, 1726, 'Bektemir tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726266, 1726, 'Yunusobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726269, 1726, 'Mirzo Ulug\'bek tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726273, 1726, 'Mirobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726277, 1726, 'Shayxontohur tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726280, 1726, 'Olmazor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726283, 1726, 'Sergeli tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726287, 1726, 'Yakkasaroy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726290, 1726, 'Yashnobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726292, 1726, 'Yangihayot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1726294, 1726, 'Chilonzor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727206, 1727, 'Oqqo`rg`on tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727212, 1727, 'Ohangaron tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727220, 1727, 'Bekobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727224, 1727, 'Bo`stonliq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727228, 1727, 'Bo`ka tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727233, 1727, 'Quyi Chirchiq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727237, 1727, 'Zangiota tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727239, 1727, 'Yuqori Chirchiq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727248, 1727, 'Qibray tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727249, 1727, 'Parkent tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727250, 1727, 'Pskent tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727253, 1727, 'O`rta Chirchiq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727256, 1727, 'Chinoz tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727259, 1727, 'Yangiyo`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727265, 1727, 'Toshkent tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727401, 1727, 'Nurafshon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727404, 1727, 'Olmaliq shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727407, 1727, 'Angren shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727413, 1727, 'Bekobod shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727415, 1727, 'Ohangaron shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727419, 1727, 'Chirchiq shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1727424, 1727, 'Yangiyo`l shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730203, 1730, 'Oltiariq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730206, 1730, 'Qo`shtepa tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730209, 1730, 'Bog`dod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730212, 1730, 'Buvayda tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730215, 1730, 'Beshariq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730218, 1730, 'Quva tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730221, 1730, 'Uchko`prik tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730224, 1730, 'Rishton tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730226, 1730, 'So`x tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730227, 1730, 'Toshloq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730230, 1730, 'O`zbekiston tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730233, 1730, 'Farg`ona tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730236, 1730, 'Dang`ara tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730238, 1730, 'Furqat tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730242, 1730, 'Yozyovon tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730401, 1730, 'Farg`ona shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730405, 1730, 'Qo`qon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730408, 1730, 'Quvasoy shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1730412, 1730, 'Marg`ilon shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733204, 1733, 'Bog`ot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733208, 1733, 'Gurlan tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733212, 1733, 'Qo`shko`pir tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733217, 1733, 'Urganch tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733220, 1733, 'Xazorasp tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733221, 1733, 'Tuproqqal\'a tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733223, 1733, 'Xonqa tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733226, 1733, 'Xiva tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733230, 1733, 'Shovot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733233, 1733, 'Yangiariq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733236, 1733, 'Yangibozor tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733401, 1733, 'Urganch shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1733406, 1733, 'Xiva shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735204, 1735, 'Amudaryo tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735207, 1735, 'Beruniy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735209, 1735, 'Bo\'zatov tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735211, 1735, 'Qorao`zak tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735212, 1735, 'Kegeyli tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735215, 1735, 'Qo`ng`irot tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735218, 1735, 'Qanliko`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735222, 1735, 'Mo`ynoq tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735225, 1735, 'Nukus tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735228, 1735, 'Taxiatosh tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735230, 1735, 'Taxtako`pir tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735233, 1735, 'To`rtko`l tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735236, 1735, 'Xo`jayli tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735240, 1735, 'Chimboy tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735243, 1735, 'Shumanay tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735250, 1735, 'Ellikqala tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1735401, 1735, 'Nukus shahri', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(9999001, 9999, 'Chet el', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714401365, 1714, 'Davlatobod tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:09:00'),
(1714401367, 1714, 'Yangi Namangan tumani', 1, '2025-10-19 17:09:00', '2025-10-19 17:14:35'),
(1714401368, 1703, 'Test', -1, '2025-10-19 17:14:01', '2025-10-19 17:14:04');

-- --------------------------------------------------------

--
-- Table structure for table `loc_region`
--

CREATE TABLE `loc_region` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loc_region`
--

INSERT INTO `loc_region` (`id`, `name`, `status`, `created`, `updated`) VALUES
(1703, 'Andijon viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1706, 'Buxoro viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1708, 'Jizzax viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1710, 'Qashqadaryo viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1712, 'Navoiy viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1714, 'Namangan viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1718, 'Samarqand viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1722, 'Surxondaryo viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1724, 'Sirdaryo viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1726, 'Toshkent shahri', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1727, 'Toshkent viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1730, 'Farg`ona viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1733, 'Xorazm viloyati', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(1735, 'Qoraqalpog`iston Respublikasi', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(9999, 'Chet el', 1, '2025-10-19 17:07:55', '2025-10-19 17:07:55'),
(10000, 'asdasd', -1, '2025-10-19 17:16:25', '2025-10-19 17:17:01');

-- --------------------------------------------------------

--
-- Table structure for table `other_paid`
--

CREATE TABLE `other_paid` (
  `id` int(11) NOT NULL,
  `type` enum('INCOME','OUTCOME') DEFAULT NULL,
  `group_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `price` decimal(19,2) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_paid`
--

INSERT INTO `other_paid` (`id`, `type`, `group_id`, `description`, `date`, `price`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'OUTCOME', 2, 'Bilmasam novi uchunlikini asdasdasd asda sdas dasd asda sd asd asdasdBilmasam novi uchunlikini asdasdasd asda sdas dasd asda sd asd asdasdBilmasam novi uchunlikini asdasdasd asda sdas dasd asda sd asd asdasd\r\n', '2025-11-01', '800000.00', -1, '2025-11-01 23:33:37', '2025-11-01 23:46:49', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `other_paid_group`
--

CREATE TABLE `other_paid_group` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_paid_group`
--

INSERT INTO `other_paid_group` (`id`, `name`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, '1123123', -1, '2025-11-01 22:26:02', '2025-11-01 22:27:34', 1, 1),
(2, 'Oylik', 1, '2025-11-01 22:26:05', '2025-11-01 22:26:05', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `name`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'Naqt', 1, '2025-11-02 20:35:29', '2025-11-02 20:35:29', 1, 1),
(2, 'Plastik karta', 1, '2025-11-02 20:35:41', '2025-11-02 20:35:41', 1, 1),
(3, 'Click/payme', 1, '2025-11-02 20:35:45', '2025-11-02 20:35:45', 1, 1),
(4, 'Bank o\'tkazmasi', 1, '2025-11-02 20:35:49', '2025-11-02 20:35:49', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `referal`
--

CREATE TABLE `referal` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `phone` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  `percent` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL,
  `balance` decimal(19,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `referal`
--

INSERT INTO `referal` (`id`, `name`, `phone`, `description`, `percent`, `status`, `created`, `updated`, `register_id`, `modify_id`, `balance`) VALUES
(1, 'Ruslan', '(33)513-0007', '', 30, 1, '2025-11-01 22:13:06', '2025-11-01 22:13:06', 1, 1, '0.00'),
(2, 'Test123', '(99)123-4567', '', 30, -1, '2025-11-01 22:13:24', '2025-11-01 22:18:29', 1, 1, '0.00');

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `departament_id` int(11) DEFAULT NULL,
  `capacity` int(11) DEFAULT 0,
  `count_patient` int(11) DEFAULT 0,
  `user_id` int(11) DEFAULT NULL,
  `price` decimal(19,2) DEFAULT 0.00,
  `price_food` decimal(19,2) DEFAULT 0.00,
  `state` enum('WORKING','CLOSED','FULL') DEFAULT 'WORKING',
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`id`, `name`, `departament_id`, `capacity`, `count_patient`, `user_id`, `price`, `price_food`, `state`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, '101', 1, 5, 0, 3, '50000.00', '30000.00', 'WORKING', 1, '2025-10-24 17:20:17', '2025-10-24 17:20:48', 1, 1),
(2, '102', 1, 6, 0, 3, '50000.00', '30000.00', 'WORKING', 1, '2025-10-24 17:22:42', '2025-10-24 17:22:42', 1, 1),
(3, 'test', 1, 0, 0, 3, '0.00', '0.00', 'WORKING', -1, '2025-10-24 17:24:06', '2025-10-24 17:25:53', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `service`
--

CREATE TABLE `service` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` double NOT NULL,
  `departament_id` int(11) NOT NULL,
  `has_file` int(11) DEFAULT 0,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service`
--

INSERT INTO `service` (`id`, `name`, `price`, `departament_id`, `has_file`, `status`, `created`, `updated`, `register_id`, `modify_id`) VALUES
(1, 'MRT', 350000, 1, 1, -1, '2025-11-10 22:32:30', '2025-11-10 22:42:22', 1, 1),
(2, 'MRT', 300000, 1, 0, 1, '2025-11-10 22:42:32', '2025-11-10 22:42:32', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `service_user`
--

CREATE TABLE `service_user` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL,
  `type` enum('FIXED','PERCENT') DEFAULT 'FIXED',
  `value` double DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `source`
--

CREATE TABLE `source` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `source`
--

INSERT INTO `source` (`id`, `name`, `status`, `created`, `updated`) VALUES
(1, 'Instagram', 1, '2025-10-24 12:05:46', '2025-10-24 12:05:46'),
(2, 'Telegram', 1, '2025-10-24 12:05:52', '2025-10-24 12:05:52'),
(3, 'Test', -1, '2025-10-24 12:05:55', '2025-10-24 12:05:58');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(500) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL DEFAULT 'default/avatar.png',
  `refresh_token` varchar(255) DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `auth_key` varchar(255) NOT NULL,
  `chat_id` varchar(255) DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `prefix` varchar(255) DEFAULT NULL,
  `token` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `username`, `password`, `phone`, `image`, `refresh_token`, `role_id`, `status`, `created`, `updated`, `auth_key`, `chat_id`, `access_token`, `prefix`, `token`) VALUES
(1, 'Admin', 'admin', '$2y$13$VoNJ/HhFAT/jP.oV1YlFc.GkTgGo65I9SXVvWtfFNvHdIi9ejL24m', '(99)967-0395', 'default/avatar.png', NULL, 100, 1, '2025-10-03 17:12:55', '2025-10-19 16:42:15', '', NULL, 'QEMbV-qE0VHVaDDGJHuDohhl9Ep3HrC0iNftJU6_ncrUulHdxCXhSfJ_c4n1awSh', NULL, NULL),
(2, 'Dilmurod', 'test[1759571500.1876][1759571778.7172]', '$2y$13$VoNJ/HhFAT/jP.oV1YlFc.GkTgGo65I9SXVvWtfFNvHdIi9ejL24m', '(99)967-0395', 'default/avatar.png', NULL, 100, -1, '2025-10-04 14:43:49', '2025-10-19 16:42:18', '', NULL, NULL, NULL, NULL),
(3, 'Kassa', 'kassa', '$2y$13$TU6mC/Ffeyvu.N5rOCjVLe1WgHSRktfElKPj.HYclk8MjMgyQ95s2', '9988', 'default/avatar.png', NULL, 90, 1, '2025-10-19 16:48:52', '2025-10-19 16:49:22', '', NULL, NULL, 'K', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_role`
--

CREATE TABLE `user_role` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_role`
--

INSERT INTO `user_role` (`id`, `name`, `url`, `status`, `created`, `updated`) VALUES
(90, 'Kassa', '/cash/', 1, '2025-10-19 16:48:32', '2025-10-19 16:48:32'),
(100, 'Administrator', '/cp/', 1, '2025-07-11 12:00:58', '2025-10-19 16:41:07');

-- --------------------------------------------------------

--
-- Table structure for table `visit`
--

CREATE TABLE `visit` (
  `id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `departament_id` int(11) DEFAULT NULL,
  `price` decimal(19,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `state` enum('NEW','RUNNING','DONE','CANCALLED') DEFAULT 'NEW',
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL,
  `is_emergency` int(11) DEFAULT 0,
  `emergency_car` varchar(255) DEFAULT NULL,
  `is_onetime_payment` int(11) DEFAULT 0,
  `visit_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visit`
--

INSERT INTO `visit` (`id`, `client_id`, `departament_id`, `price`, `description`, `state`, `status`, `created`, `updated`, `register_id`, `modify_id`, `is_emergency`, `emergency_car`, `is_onetime_payment`, `visit_date`) VALUES
(1, 1, NULL, '0.00', '', 'NEW', -1, '2025-11-13 23:27:36', '2025-11-13 23:27:39', 1, 1, 0, '', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `visit_referal`
--

CREATE TABLE `visit_referal` (
  `id` int(11) NOT NULL,
  `visit_id` int(11) NOT NULL,
  `referal_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `price` decimal(19,2) DEFAULT 0.00,
  `price_referal` decimal(19,2) DEFAULT 0.00,
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visit_room`
--

CREATE TABLE `visit_room` (
  `id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `visit_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `card_number` varchar(255) DEFAULT NULL,
  `card_id` int(11) DEFAULT NULL,
  `date_start` date DEFAULT NULL,
  `date_end` date DEFAULT NULL,
  `state` enum('TREAT','GONE') DEFAULT 'TREAT',
  `status` int(11) DEFAULT 1,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL,
  `is_food_connected` int(11) DEFAULT 0,
  `price` decimal(19,2) DEFAULT 0.00,
  `price_count` decimal(19,2) DEFAULT 0.00,
  `doctor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visit_service`
--

CREATE TABLE `visit_service` (
  `id` int(11) NOT NULL,
  `doctor_id` int(11) DEFAULT NULL,
  `service_id` int(11) DEFAULT NULL,
  `visit_id` int(11) DEFAULT NULL,
  `departament_id` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `code_id` int(11) DEFAULT NULL,
  `visit_time` datetime DEFAULT NULL,
  `price` decimal(19,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` int(11) DEFAULT 1,
  `register_id` int(11) DEFAULT NULL,
  `modify_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_client_group_id` (`group_id`),
  ADD KEY `FK_client_region_id` (`region_id`),
  ADD KEY `FK_client_district_id` (`district_id`),
  ADD KEY `FK_client_source_id` (`source_id`),
  ADD KEY `FK_client_register_id` (`register_id`),
  ADD KEY `FK_client_modify_id` (`modify_id`);

--
-- Indexes for table `client_group`
--
ALTER TABLE `client_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_client_group_register_id` (`register_id`),
  ADD KEY `FK_client_group_modify_id` (`modify_id`);

--
-- Indexes for table `client_paid`
--
ALTER TABLE `client_paid`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_client_paid_client_id` (`client_id`),
  ADD KEY `FK_client_paid_payment_id` (`payment_id`),
  ADD KEY `FK_client_paid_register_id` (`register_id`),
  ADD KEY `FK_client_paid_modify_id` (`modify_id`);

--
-- Indexes for table `departament`
--
ALTER TABLE `departament`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_departament_owner_id` (`owner_id`),
  ADD KEY `FK_departament_register_id` (`register_id`),
  ADD KEY `FK_departament_modify_id` (`modify_id`);

--
-- Indexes for table `loc_district`
--
ALTER TABLE `loc_district`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_loc_district_region_id` (`region_id`);

--
-- Indexes for table `loc_region`
--
ALTER TABLE `loc_region`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `other_paid`
--
ALTER TABLE `other_paid`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_paid_other_group_id` (`group_id`),
  ADD KEY `FK_other_paid_register_id` (`register_id`),
  ADD KEY `FK_other_paid_modify_id` (`modify_id`);

--
-- Indexes for table `other_paid_group`
--
ALTER TABLE `other_paid_group`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_other_paid_type_modify_id` (`modify_id`),
  ADD KEY `FK_other_paid_type_register_id` (`register_id`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_payment_register_id` (`register_id`),
  ADD KEY `FK_payment_modify_id` (`modify_id`);

--
-- Indexes for table `referal`
--
ALTER TABLE `referal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_referal_register_id` (`register_id`),
  ADD KEY `FK_referal_modify_id` (`modify_id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_room_departament_id` (`departament_id`),
  ADD KEY `FK_room_user_id` (`user_id`),
  ADD KEY `FK_room_register_id` (`register_id`),
  ADD KEY `FK_room_modify_id` (`modify_id`);

--
-- Indexes for table `service`
--
ALTER TABLE `service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_service_departament_id` (`departament_id`),
  ADD KEY `FK_service_register_id` (`register_id`),
  ADD KEY `FK_service_modify_id` (`modify_id`);

--
-- Indexes for table `service_user`
--
ALTER TABLE `service_user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_service_user_user_id` (`user_id`),
  ADD KEY `FK_service_user_service_id` (`service_id`),
  ADD KEY `FK_service_user_register_id` (`register_id`),
  ADD KEY `FK_service_user_modify_id` (`modify_id`);

--
-- Indexes for table `source`
--
ALTER TABLE `source`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_user_role_id` (`role_id`);

--
-- Indexes for table `user_role`
--
ALTER TABLE `user_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visit`
--
ALTER TABLE `visit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_visit_client_id` (`client_id`),
  ADD KEY `FK_visit_register_id` (`register_id`),
  ADD KEY `FK_visit_modify_id` (`modify_id`),
  ADD KEY `FK_visit_departament_id` (`departament_id`);

--
-- Indexes for table `visit_referal`
--
ALTER TABLE `visit_referal`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_visit_referal_visit_id` (`visit_id`),
  ADD KEY `FK_visit_referal_referal_id` (`referal_id`),
  ADD KEY `FK_visit_referal_service_id` (`service_id`),
  ADD KEY `FK_visit_referal_register_id` (`register_id`),
  ADD KEY `FK_visit_referal_modify_id` (`modify_id`);

--
-- Indexes for table `visit_room`
--
ALTER TABLE `visit_room`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_visit_room_room_id` (`room_id`),
  ADD KEY `FK_visit_room_visit_id` (`visit_id`),
  ADD KEY `FK_visit_room_client_id` (`client_id`),
  ADD KEY `FK_visit_room_register_id` (`register_id`),
  ADD KEY `FK_visit_room_modify_id` (`modify_id`),
  ADD KEY `FK_visit_room_doctor_id` (`doctor_id`);

--
-- Indexes for table `visit_service`
--
ALTER TABLE `visit_service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_visit_service_doctor_id` (`doctor_id`),
  ADD KEY `FK_visit_service_service_id` (`service_id`),
  ADD KEY `FK_visit_service_visit_id` (`visit_id`),
  ADD KEY `FK_visit_service_departament_id` (`departament_id`),
  ADD KEY `FK_visit_service_register_id` (`register_id`),
  ADD KEY `FK_visit_service_modify_id` (`modify_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client_group`
--
ALTER TABLE `client_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client_paid`
--
ALTER TABLE `client_paid`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departament`
--
ALTER TABLE `departament`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `loc_district`
--
ALTER TABLE `loc_district`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1714401369;

--
-- AUTO_INCREMENT for table `loc_region`
--
ALTER TABLE `loc_region`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10001;

--
-- AUTO_INCREMENT for table `other_paid`
--
ALTER TABLE `other_paid`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `other_paid_group`
--
ALTER TABLE `other_paid_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `referal`
--
ALTER TABLE `referal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `service`
--
ALTER TABLE `service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `service_user`
--
ALTER TABLE `service_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `source`
--
ALTER TABLE `source`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_role`
--
ALTER TABLE `user_role`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `visit`
--
ALTER TABLE `visit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `visit_referal`
--
ALTER TABLE `visit_referal`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visit_room`
--
ALTER TABLE `visit_room`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `visit_service`
--
ALTER TABLE `visit_service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `client`
--
ALTER TABLE `client`
  ADD CONSTRAINT `FK_client_district_id` FOREIGN KEY (`district_id`) REFERENCES `loc_district` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_group_id` FOREIGN KEY (`group_id`) REFERENCES `client_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_region_id` FOREIGN KEY (`region_id`) REFERENCES `loc_region` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_source_id` FOREIGN KEY (`source_id`) REFERENCES `source` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `client_group`
--
ALTER TABLE `client_group`
  ADD CONSTRAINT `FK_client_group_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_group_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `client_paid`
--
ALTER TABLE `client_paid`
  ADD CONSTRAINT `FK_client_paid_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_paid_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_paid_payment_id` FOREIGN KEY (`payment_id`) REFERENCES `payment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_client_paid_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `departament`
--
ALTER TABLE `departament`
  ADD CONSTRAINT `FK_departament_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_departament_owner_id` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_departament_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `loc_district`
--
ALTER TABLE `loc_district`
  ADD CONSTRAINT `FK_loc_district_region_id` FOREIGN KEY (`region_id`) REFERENCES `loc_region` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `other_paid`
--
ALTER TABLE `other_paid`
  ADD CONSTRAINT `FK_other_paid_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_other_paid_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_paid_other_group_id` FOREIGN KEY (`group_id`) REFERENCES `other_paid_group` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `other_paid_group`
--
ALTER TABLE `other_paid_group`
  ADD CONSTRAINT `FK_other_paid_type_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_other_paid_type_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `FK_payment_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_payment_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `referal`
--
ALTER TABLE `referal`
  ADD CONSTRAINT `FK_referal_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_referal_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `FK_room_departament_id` FOREIGN KEY (`departament_id`) REFERENCES `departament` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_room_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_room_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_room_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `service`
--
ALTER TABLE `service`
  ADD CONSTRAINT `FK_service_departament_id` FOREIGN KEY (`departament_id`) REFERENCES `departament` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_service_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_service_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `service_user`
--
ALTER TABLE `service_user`
  ADD CONSTRAINT `FK_service_user_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_service_user_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_service_user_service_id` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_service_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FK_user_role_id` FOREIGN KEY (`role_id`) REFERENCES `user_role` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `visit`
--
ALTER TABLE `visit`
  ADD CONSTRAINT `FK_visit_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_departament_id` FOREIGN KEY (`departament_id`) REFERENCES `departament` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `visit_referal`
--
ALTER TABLE `visit_referal`
  ADD CONSTRAINT `FK_visit_referal_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_referal_referal_id` FOREIGN KEY (`referal_id`) REFERENCES `referal` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_referal_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_referal_service_id` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_referal_visit_id` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `visit_room`
--
ALTER TABLE `visit_room`
  ADD CONSTRAINT `FK_visit_room_client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_room_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_room_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_room_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_room_room_id` FOREIGN KEY (`room_id`) REFERENCES `room` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_room_visit_id` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `visit_service`
--
ALTER TABLE `visit_service`
  ADD CONSTRAINT `FK_visit_service_departament_id` FOREIGN KEY (`departament_id`) REFERENCES `departament` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_service_doctor_id` FOREIGN KEY (`doctor_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_service_modify_id` FOREIGN KEY (`modify_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_service_register_id` FOREIGN KEY (`register_id`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_service_service_id` FOREIGN KEY (`service_id`) REFERENCES `service` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_visit_service_visit_id` FOREIGN KEY (`visit_id`) REFERENCES `visit` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
