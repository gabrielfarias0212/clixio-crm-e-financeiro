
  // Update the handleMarkAsDelivered function to set sessionStorage
  const handleMarkAsDelivered = async () => {
    if (!client || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      const updatedClient = await updateClient(client.id, {
        status: "pago",
        nextAction: "nenhuma"
      });
      
      if (updatedClient) {
        toast.success("Trabalho marcado como entregue com sucesso!");
        // Set flag in sessionStorage to show alert on clients list page
        sessionStorage.setItem('hasDeliveredWork', 'true');
        refreshClients();
      } else {
        toast.error("Erro ao marcar trabalho como entregue");
      }
    } catch (error) {
      toast.error("Erro ao atualizar o status do cliente");
      console.error("Error marking work as delivered:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
