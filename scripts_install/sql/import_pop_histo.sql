drop table if exists pop_histo;
create table pop_histo
    (CODGEO text primary key, REG text not null, DEP text not null, LIBGEO text not null,
    PMUN15 integer, PMUN14 integer, PMUN13 integer, PMUN12 integer, PMUN11 integer, PMUN10 integer,
    PMUN09 integer, PMUN08 integer, PMUN07 integer, PMUN06 integer, PSDC99 integer, PSDC90 integer,
    PSDC82 integer, PSDC75 integer, PSDC68 integer, PSDC62 integer, PTOT54 integer, PTOT36 integer,
    PTOT1931 integer, PTOT1926 integer, PTOT1921 integer, PTOT1911 integer, PTOT1906 integer,
    PTOT1901 integer, PTOT1896 integer, PTOT1891 integer, PTOT1886 integer, PTOT1881 integer, PTOT1876 integer);

\COPY pop_histo from 'base-pop-historiques-1876-2015.csv' DELIMITER ',' CSV HEADER;
insert into pop_histo
    select '75056', '11', '75', 'Paris', sum(PMUN15), sum(PMUN14), sum(PMUN13),
    sum(PMUN12), sum(PMUN11), sum(PMUN10), sum(PMUN09), sum(PMUN08), sum(PMUN07), sum(PMUN06),
    sum(PSDC99), sum(PSDC90), sum(PSDC82), sum(PSDC75), sum(PSDC68), sum(PSDC62), sum(PTOT54),
    sum(PTOT36), sum(PTOT1931), sum(PTOT1926), sum(PTOT1921), sum(PTOT1911), sum(PTOT1906),
    sum(PTOT1901), sum(PTOT1896), sum(PTOT1891), sum(PTOT1886), sum(PTOT1881), sum(PTOT1876)
    from pop_histo where codgeo like '75%'
