/*
# Copyright (C) 2020 MuhammedKpln.
#
# FEDAI is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# FEDAI is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.
#
*/

import { DataTypes } from 'sequelize';
import { database } from '../../core/database';

export const NotesDB = database.define('notes', {
  note: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});

export async function getNotes() {
  const Notes = await NotesDB.findAll();

  return Notes;
}

export async function saveNote(note) {
  return await NotesDB.create({ note });
}

export async function deleteAllNotes() {
  return await NotesDB.destroy({
    where: {},
    truncate: true,
  });
}
