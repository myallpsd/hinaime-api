// Dynamic date option generation
const currentYear = new Date().getFullYear();
const yearOptions = [{ value: '', key: 'year', label: 'Year', index: 0 }];
let yi = 1;
for (let y = currentYear; y >= 1917; y--) yearOptions.push({ value: String(y), key: String(y), label: String(y), index: yi++ });

const monthOptions = [{ value: '', key: 'month', label: 'Month', index: 0 }];
for (let m = 1; m <= 12; m++) monthOptions.push({ value: String(m), key: String(m), label: String(m).padStart(2, '0'), index: m });

const dayOptions = [{ value: '', key: 'day', label: 'Day', index: 0 }];
for (let d = 1; d <= 31; d++) dayOptions.push({ value: String(d), key: String(d), label: String(d).padStart(2, '0'), index: d });

const filterOptions = {
  // Legacy array used for normalization and indexing
  type: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'movie', label: 'Movie', index: 1 },
    { value: '2', key: 'tv', label: 'TV', index: 2 },
    { value: '3', key: 'ova', label: 'OVA', index: 3 },
    { value: '4', key: 'ona', label: 'ONA', index: 4 },
    { value: '5', key: 'special', label: 'Special', index: 5 },
    { value: '6', key: 'music', label: 'Music', index: 6 },
  ],
  status: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'finished_airing', label: 'Finished Airing', index: 1 },
    { value: '2', key: 'currently_airing', label: 'Currently Airing', index: 2 },
    { value: '3', key: 'not_yet_aired', label: 'Not yet aired', index: 3 },
  ],

  rated: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'g', label: 'G', index: 1 },
    { value: '2', key: 'pg', label: 'PG', index: 2 },
    { value: '3', key: 'pg-13', label: 'PG-13', index: 3 },
    { value: '4', key: 'r', label: 'R', index: 4 },
    { value: '5', key: 'r+', label: 'R+', index: 5 },
    { value: '6', key: 'rx', label: 'Rx', index: 6 },
  ],

  score: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'appalling', label: '(1) Appalling', index: 1 },
    { value: '2', key: 'horrible', label: '(2) Horrible', index: 2 },
    { value: '3', key: 'very_bad', label: '(3) Very Bad', index: 3 },
    { value: '4', key: 'bad', label: '(4) Bad', index: 4 },
    { value: '5', key: 'average', label: '(5) Average', index: 5 },
    { value: '6', key: 'fine', label: '(6) Fine', index: 6 },
    { value: '7', key: 'good', label: '(7) Good', index: 7 },
    { value: '8', key: 'very_good', label: '(8) Very Good', index: 8 },
    { value: '9', key: 'great', label: '(9) Great', index: 9 },
    { value: '10', key: 'masterpiece', label: '(10) Masterpiece', index: 10 },
  ],

  season: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'spring', label: 'Spring', index: 1 },
    { value: '2', key: 'summer', label: 'Summer', index: 2 },
    { value: '3', key: 'fall', label: 'Fall', index: 3 },
    { value: '4', key: 'winter', label: 'Winter', index: 4 },
  ],

  language: [
    { value: '', key: 'all', label: 'All', index: 0 },
    { value: '1', key: 'sub', label: 'SUB', index: 1 },
    { value: '2', key: 'dub', label: 'DUB', index: 2 },
    { value: '3', key: 'sub_dub', label: 'SUB & DUB', index: 3 },
  ],
  // Explicit select options for sort (uses option values)
  sort: [
    { value: 'default', key: 'default', label: 'Default' },
    { value: 'recently_added', key: 'recently_added', label: 'Recently Added' },
    { value: 'recently_updated', key: 'recently_updated', label: 'Recently Updated' },
    { value: 'score', key: 'score', label: 'Score' },
    { value: 'name_az', key: 'name_az', label: 'Name A-Z' },
    { value: 'released_date', key: 'released_date', label: 'Released Date' },
    { value: 'most_watched', key: 'most_watched', label: 'Most Watched' },
  ],

  // Genres as provided by site (value = data-id)
  genres: [
    { value: '1', key: 'action', label: 'Action' },
    { value: '2', key: 'adventure', label: 'Adventure' },
    { value: '3', key: 'cars', label: 'Cars' },
    { value: '4', key: 'comedy', label: 'Comedy' },
    { value: '5', key: 'dementia', label: 'Dementia' },
    { value: '6', key: 'demons', label: 'Demons' },
    { value: '8', key: 'drama', label: 'Drama' },
    { value: '9', key: 'ecchi', label: 'Ecchi' },
    { value: '10', key: 'fantasy', label: 'Fantasy' },
    { value: '11', key: 'game', label: 'Game' },
    { value: '35', key: 'harem', label: 'Harem' },
    { value: '13', key: 'historical', label: 'Historical' },
    { value: '14', key: 'horror', label: 'Horror' },
    { value: '44', key: 'isekai', label: 'Isekai' },
    { value: '43', key: 'josei', label: 'Josei' },
    { value: '15', key: 'kids', label: 'Kids' },
    { value: '16', key: 'magic', label: 'Magic' },
    { value: '17', key: 'martial_arts', label: 'Martial Arts' },
    { value: '18', key: 'mecha', label: 'Mecha' },
    { value: '38', key: 'military', label: 'Military' },
    { value: '19', key: 'music', label: 'Music' },
    { value: '7', key: 'mystery', label: 'Mystery' },
    { value: '20', key: 'parody', label: 'Parody' },
    { value: '39', key: 'police', label: 'Police' },
    { value: '40', key: 'psychological', label: 'Psychological' },
    { value: '22', key: 'romance', label: 'Romance' },
    { value: '21', key: 'samurai', label: 'Samurai' },
    { value: '23', key: 'school', label: 'School' },
    { value: '24', key: 'sci-fi', label: 'Sci-Fi' },
    { value: '42', key: 'seinen', label: 'Seinen' },
    { value: '25', key: 'shoujo', label: 'Shoujo' },
    { value: '26', key: 'shoujo_ai', label: 'Shoujo Ai' },
    { value: '27', key: 'shounen', label: 'Shounen' },
    { value: '28', key: 'shounen_ai', label: 'Shounen Ai' },
    { value: '36', key: 'slice_of_life', label: 'Slice of Life' },
    { value: '29', key: 'space', label: 'Space' },
    { value: '30', key: 'sports', label: 'Sports' },
    { value: '31', key: 'super_power', label: 'Super Power' },
    { value: '37', key: 'supernatural', label: 'Supernatural' },
    { value: '41', key: 'thriller', label: 'Thriller' },
    { value: '32', key: 'vampire', label: 'Vampire' },
  ],

  // Date selects (sy/sm/sd and ey/em/ed)
  sy: yearOptions,
  sm: monthOptions,
  sd: dayOptions,
  ey: yearOptions,
  em: monthOptions,
  ed: dayOptions,

};

export default filterOptions;
