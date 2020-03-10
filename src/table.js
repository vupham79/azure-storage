import React, { useState, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import MaterialTable from "material-table";
import {
  Add,
  Search,
  Delete,
  Edit,
  NavigateNext,
  NavigateBefore,
  LastPage,
  FirstPage,
  Clear,
  Sort,
  Save,
  Cancel
} from "@material-ui/icons";
import * as azureTable from "./azure-storage.table.min";
const tableUri = "https://vuph123.table.core.windows.net";
const SAS =
  "?sv=2019-02-02&ss=bfqt&srt=sco&sp=rwdlacup&se=2023-02-11T16:56:34Z&st=2020-03-03T08:56:34Z&spr=https&sig=1HC%2B66Wl60x8nPt4f%2BLraDQ7jFFXTd8j%2BzV1O%2BRimQw%3D";
const tableService = azureTable.createTableServiceWithSas(tableUri, SAS);

export default function MaterialTableDemo() {
  const [entities, setEntities] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [state, setState] = React.useState({
    columns: [
      { title: "Book Id", field: "id" },
      { title: "Book Title", field: "title" },
      {
        title: "Price",
        field: "price",
        type: "currency",
        currencySetting: {
          locale: "vi-VN",
          currencyCode: "VND"
        }
      }
    ]
  });

  useEffect(() => {
    getTable();
  }, []);

  function getTable() {
    // console.log(azureTable.TableQuery({ top: 200 }));
    var tableQuery = azureTable.TableQuery();
    tableService.queryEntities("books", tableQuery, null, function(
      error,
      results
    ) {
      setLoading(false);
      if (error) {
        // Query entities error
      } else {
        const data = [];
        for (var i = 0, entity; (entity = results.entries[i]); i++) {
          // Deal with entity object
          data.push({
            partitionKey: entity.PartitionKey._,
            id: entity.RowKey._,
            title: entity.CustomProperty1._,
            price: entity.CustomProperty2._
          });
        }
        setEntities(data);
      }
    });
  }

  function addEntity(PartitionKey, RowKey, CustomProperty1, CustomProperty2) {
    var insertEntity = {
      PartitionKey: { _: PartitionKey },
      RowKey: { _: RowKey },
      CustomProperty1: { _: CustomProperty1 },
      CustomProperty2: { _: CustomProperty2 }
    };
    tableService.insertOrReplaceEntity("books", insertEntity, function(
      error,
      result,
      response
    ) {
      setLoading(false);
      if (error) {
        // Insert table entity error
        console.log("error: ", error);
      } else {
        // Insert table entity successfully
        getTable();
      }
    });
  }

  function deleteEntity(partitionKey, rowKey) {
    var deleteEntity = {
      PartitionKey: { _: partitionKey },
      RowKey: { _: rowKey }
    };

    tableService.deleteEntity("books", deleteEntity, function(
      error,
      result,
      response
    ) {
      setLoading(false);
      if (error) {
        // Delete table entity error
      } else {
        // Delete table entity successfully
        getTable();
      }
    });
  }

  return (
    <MaterialTable
      title="Book Store"
      style={{ width: "80%" }}
      columns={state.columns}
      data={entities}
      icons={{
        Add,
        Edit,
        ResetSearch: Clear,
        Delete,
        NextPage: NavigateNext,
        PreviousPage: NavigateBefore,
        FirstPage,
        LastPage,
        Search,
        SortArrow: Sort,
        Clear: Cancel,
        Check: Save
      }}
      editable={{
        onRowAdd: newData =>
          new Promise(resolve => {
            addEntity(uuidv1(), newData.id, newData.title, newData.price);
            setLoading(false);
          }),
        onRowUpdate: (newData, oldData) =>
          new Promise(resolve => {
            addEntity(
              oldData.partitionKey,
              newData.id,
              newData.title,
              newData.price
            );
          }),
        onRowDelete: oldData =>
          new Promise(resolve => {
            deleteEntity(oldData.partitionKey, oldData.id);
          })
      }}
    />
  );
}
