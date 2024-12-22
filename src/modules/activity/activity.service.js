const database = require('../../database/database');

const connection = database.connection;


class ActivityService {


    async saveActivity(user_id, info) {
        try {
            const data = [info.name, info.type, user_id];
            const query = 'INSERT INTO activities (name, type, user_id, created_at) VALUES ($1, $2, $3, current_timestamp) RETURNING id';
            const { rows } = await connection.query(query, data);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }
 
    async saveCrucigrams(activity_id, crucis){
        try {
            if(crucis.length){
                const values = [];
                const queryValues = crucis.map((cruci, index) => {
                  const position = index * 5; 
                  values.push(cruci.question, cruci.answer, cruci.index, cruci.position, activity_id);
                  return `($${position + 1}, $${position + 2}, $${position + 3}, $${position + 4}, $${position + 5})`;
                }).join(', ');
                const query = `
                  INSERT INTO crucigram (question, answer, index, position, activity_id)
                  VALUES ${queryValues}
                  RETURNING id;
                `;
                const { rows } = await connection.query(query, values);
                return rows[0];
            }
            return true;
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async saveActivityResponse(user_id, activity_id, crucis){
        try {
            if(crucis.length){
                const values = [];
                const queryValues = crucis.map((cruci, index) => {
                  const position = index * 6; 
                  values.push(cruci.question, cruci.answer, cruci.index, cruci.position, activity_id, user_id);
                  return `($${position + 1}, $${position + 2}, $${position + 3}, $${position + 4}, $${position + 5}, $${position + 6})`;
                }).join(', ');
                const query = `
                  INSERT INTO activity_response (question, answer, index, position, activity_id, paciente_id)
                  VALUES ${queryValues}
                  RETURNING id;
                `;
                const { rows } = await connection.query(query, values);
                return rows[0];
            }
            return true;
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async saveActInGroup(id, groups){
        try {
            const result = await this.deleteActInGroup(id);
            if(groups.length){
                const values = [];
                const queryValues = groups.map((group, index) => {
                  const position = index * 2; 
                  values.push(group.id, id);
                  return `($${position + 1}, $${position + 2})`;
                }).join(', ');
                const query = `
                  INSERT INTO activity_group (group_id, activity_id)
                  VALUES ${queryValues};
                `;
                const { rows } = await connection.query(query, values);
                return rows;
            }
            return true;
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async deleteActInGroup(id){
        try {
            const query = `delete from activity_group where activity_id = ${id} returning id`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async updateActivity(user_id, activity_id, info) {
        try {
            let updateQuery;
            let values;
            updateQuery = `
                  UPDATE activities
                  SET name = $1, type = $2
                  WHERE user_id = $3 and id = $4
                  RETURNING id;
                `;
                values = [info.name, info.type, user_id, activity_id];
            const { rows } = await connection.query(updateQuery, values);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async updateCrucigrams(activity_id, crucis) {
        try {
            const query = `delete from crucigram where activity_id = ${activity_id} returning id`;
            const { rows } = await connection.query(query);
            if(rows[0].id){
                const result = await this.saveCrucigrams(activity_id, crucis);
                if(result.id){
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async deleteActivity(id) {
        try {
            const query = `delete from activities where id = ${id} returning id`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        } 
    }

    async getActivities(id, limit, page) {
        try {
            const query = `select * from activities where user_id = ${id} limit ${limit} offset ${page}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getActivity(user_id, activity_id) {
        try {
            const query = `select * from activities where user_id = ${user_id} and id = ${activity_id}`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getCountActivity(id) {
        try {
            const query = `select count(*) from activities where user_id = ${id}`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getCrucisByActivity(id) {
        try {
            const query = `select * from crucigram where activity_id = ${id}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getCrucisByPatient(id) {
        try {
            const query = `select * from crucigram where activity_id = ${id}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getResponseByPatientAndAct(user_id, activity_id) {
        try {
            const query = `select * from activity_response where activity_id = ${activity_id} and paciente_id = ${user_id}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return  false;
        }
    }

    async getActivitiesByAll(id, data, limit, page) {
        try {
            const query = `select * from activities 
                            where ( name like '%${data}%' OR type like '%${data}%' ) 
                            AND ( user_id = ${id} )
                            order by name
                            limit ${limit} offset ${page}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return  false;
        }
    }
    
    async getActState(user_id, activity_id){
        try {
            const query = `select state from activity_state where paciente_id = ${user_id} and activity_id = ${activity_id}`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getGroupsInAct(activity_id) {
        try {
            const query = `select group_id as id from activity_group where activity_id = ${activity_id}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getActivitiesByPatientAndAll(id, data, limit, page) {
        try {
            const query = `select a.id, a.name, a.type, a.user_id, a.created_at from activities as a
                            inner join activity_group as at
                            on at.activity_id = a.id 
                            inner join group_patient as gp
                            on gp.group_id = at.group_id and gp.paciente_id = ${id} 
                            and (a.name like '%${data}%' or a.type like '%${data}%') 
                            order by a.name
                            limit ${limit} offset ${page}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getActivitiesByPatient(id, limit, page) {
        try {
            const query = `select a.id, a.name, a.type, a.user_id, a.created_at from activities as a
                            inner join activity_group as at
                            on at.activity_id = a.id 
                            inner join group_patient as gp
                            on gp.group_id = at.group_id and gp.paciente_id = ${id}
                            order by a.name
                            limit ${limit} offset ${page}`;
            const { rows } = await connection.query(query);
            return rows;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getCountActivitiesByPatient(id){
        try {
            const query = `select count(*) from activities as a
                            inner join activity_group as at
                            on at.activity_id = a.id 
                            inner join group_patient as gp
                            on gp.group_id = at.group_id and gp.paciente_id = ${id}`;
            const { rows } = await connection.query(query);
            return rows[0];
        } catch (error) {
            console.log(error)
            return false;
        }
    }

}

module.exports = ActivityService;