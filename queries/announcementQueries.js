module.exports = {
  /**
   * @returns {{statement}}
   */
  GET_ANNOUNCEMENTS: () => {
    return {
      statement: `MATCH (announcement:Announcement) WITH apoc.map.removeKey(announcement {.*}, '') as announcement RETURN announcement`,
    };
  },
  /**
   * @param {Object} data
   *
   * @param {String} data.id The announcement id
   * @param {String} data.announcementTitle The announcement title
   * @param {String} data.announcementBody The announcement body
   *
   * @returns {{statement, data}}
   */
  ADD_ANNOUNCEMENT: (data) => {
    return {
      statement: `CREATE (announcement:Announcement { id: $id, announcementTitle: $announcementTitle, announcementBody: $announcementBody }) RETURN announcement`,
      data,
    };
  },
};
