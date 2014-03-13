CREATE TABLE `wiwdb`.`gifts` (
  `id` INT UNSIGNED NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `price` DECIMAL UNSIGNED NULL,
  `currency` VARCHAR(30) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC));

INSERT INTO `wiwdb`.`gifts` (`id`, `description`, `price`, `currency`) VALUES ('1', 'XBOX ONE', '500', 'dollar');

INSERT INTO `wiwdb`.`gifts` (`id`, `description`, `price`, `currency`) VALUES ('33', 'Lentes Transition', '400', 'peso colombiano');